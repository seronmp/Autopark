import { NextRequest, NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db";
import { createOutlookEvent, deleteOutlookEvent } from "@/lib/outlook";
import { getToken } from "next-auth/jwt";

export async function GET() {
  try {
    const result = await query(
      `SELECT r.id, r.resource_id, r.user_name, r.user_email, r.start_time, r.end_time,
              r.start_km, r.end_km, r.notes, r.purpose, r.department, r.status,
              r.outlook_event_id, res.name AS vehicle_name, res.plate AS license_plate
       FROM reservations r
       LEFT JOIN resources res ON res.id = r.resource_id
       ORDER BY r.start_time DESC`
    );
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error("Fehler beim Laden der Reservierungen:", error);
    return NextResponse.json({ error: "Reservierungen konnten nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resourceId, vehicle, startDateTime, endDateTime, startKm, endKm, notes, title,
      userName: requestedUserName, purpose, department } = body;

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const parsedStartKm = Number(startKm);
    if (!resourceId || !Number.isInteger(Number(resourceId)) || !Number.isFinite(start.getTime()) ||
        !Number.isFinite(end.getTime()) || start >= end || !Number.isInteger(parsedStartKm) || parsedStartKm < 0) {
      return NextResponse.json(
        { error: "Bitte prüfen Sie Fahrzeug, Zeitraum und Start-Kilometerstand." },
        { status: 400 }
      );
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userName = String(requestedUserName || token?.name || token?.email || "Benutzer").trim();
    const userEmail = token?.email || "noreply@ewosgroup.com";
    const dbResult = await withTransaction(async (client) => {
      const resource = await client.query(
        `SELECT id, name, status, is_active FROM resources WHERE id = $1 FOR UPDATE`,
        [Number(resourceId)]
      );
      if (!resource.rows[0] || resource.rows[0].is_active === false || resource.rows[0].status === "maintenance") {
        throw Object.assign(new Error("Dieses Fahrzeug ist nicht verfügbar."), { statusCode: 409 });
      }

      const overlap = await client.query(
        `SELECT id FROM reservations
         WHERE resource_id = $1 AND status NOT IN ('cancelled', 'rejected')
           AND start_time < $3 AND end_time > $2
         LIMIT 1`,
        [Number(resourceId), startDateTime, endDateTime]
      );
      if (overlap.rowCount) {
        throw Object.assign(new Error("Das Fahrzeug ist in diesem Zeitraum bereits gebucht."), { statusCode: 409 });
      }

      return client.query(
        `INSERT INTO reservations (
          resource_id, user_name, user_email, start_time, end_time,
          start_km, end_km, notes, purpose, department, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'confirmed')
        RETURNING id`,
        [Number(resourceId), userName, userEmail, startDateTime, endDateTime, parsedStartKm,
          endKm === undefined || endKm === null || endKm === "" ? null : Number(endKm),
          notes || null, purpose || null, department || null]
      );
    });

    let outlookEventId: string | null = null;
    let calendarSynced = false;
    try {
      const outlookRes = await createOutlookEvent(req, {
        title: title || `Fahrzeugreservierung: ${vehicle || resourceId} (${userName})`,
        startDateTime,
        endDateTime,
        vehicle: vehicle || String(resourceId),
        startKm: parsedStartKm,
        endKm: endKm ? Number(endKm) : undefined,
        notes,
      });
      outlookEventId = outlookRes?.id || null;
      calendarSynced = Boolean(outlookEventId);
      if (outlookEventId) {
        await query(
          "UPDATE reservations SET outlook_event_id = $1, outlook_calendar_id = $2 WHERE id = $3",
          [outlookEventId, outlookRes.calendarId || null, dbResult.rows[0].id]
        );
      }
    } catch (outlookError) {
      console.warn("Outlook-Synchronisierung fehlgeschlagen:", outlookError);
    }

    return NextResponse.json(
      { success: true, calendarSynced, message: "Reservierung gespeichert.", id: dbResult.rows[0]?.id },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Fehler beim Verarbeiten der Reservierung:", error);
    return NextResponse.json(
      { error: error.message || "Interner Serverfehler" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, endKm } = await req.json();
    if (!Number.isInteger(Number(id)) || !["completed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Ungültige Buchung oder Aktion." }, { status: 400 });
    }

    const updated = await withTransaction(async (client) => {
      const result = await client.query(
        `SELECT id, resource_id, start_km, outlook_event_id, outlook_calendar_id FROM reservations WHERE id = $1 FOR UPDATE`, [Number(id)]
      );
      const reservation = result.rows[0];
      if (!reservation) throw Object.assign(new Error("Buchung nicht gefunden."), { statusCode: 404 });

      if (status === "completed") {
        const finalKm = Number(endKm);
        if (!Number.isInteger(finalKm) || finalKm < Number(reservation.start_km)) {
          throw Object.assign(new Error("Der Endkilometerstand muss mindestens dem Startkilometerstand entsprechen."), { statusCode: 400 });
        }
        await client.query(
          `UPDATE resources SET current_km = GREATEST(COALESCE(current_km, 0), $1) WHERE id = $2`,
          [finalKm, reservation.resource_id]
        );
        const update = await client.query(
          `UPDATE reservations SET end_km = $1, status = 'completed' WHERE id = $2 RETURNING id, status, end_km`,
          [finalKm, Number(id)]
        );
        return { update, outlookEventId: reservation.outlook_event_id, outlookCalendarId: reservation.outlook_calendar_id };
      }
      const update = await client.query(
        `UPDATE reservations SET status = 'cancelled' WHERE id = $1 RETURNING id, status, end_km`, [Number(id)]
      );
      return { update, outlookEventId: reservation.outlook_event_id, outlookCalendarId: reservation.outlook_calendar_id };
    });

    let calendarSynced: boolean | undefined;
    if (status === "cancelled" && updated.outlookEventId) {
      calendarSynced = false;
      try {
        await deleteOutlookEvent(req, updated.outlookEventId, updated.outlookCalendarId);
        calendarSynced = true;
      } catch (outlookError) {
        console.warn("Outlook-Termin konnte nicht storniert werden:", outlookError);
      }
    }
    return NextResponse.json({ success: true, data: updated.update.rows[0], calendarSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Buchung konnte nicht aktualisiert werden." }, { status: error.statusCode || 500 });
  }
}