import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import ical, { ICalEventBusyStatus } from "ical-generator";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const expectedToken = process.env.CALENDAR_FEED_TOKEN;

  if (!expectedToken || !token || token !== expectedToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const res = await query(
      `SELECT r.id, r.start_time, r.end_time, r.user_name, r.start_km, r.end_km, r.notes, 
              res.name AS vehicle_name
       FROM reservations r
       LEFT JOIN resources res ON r.resource_id = res.id
       WHERE r.status != 'cancelled'
       ORDER BY r.start_time ASC`
    );

    // NON impostare method: ICalCalendarMethod.REQUEST
    const calendar = ical({
      name: "Autopark Buchungen",
      timezone: "Europe/Rome",
    });

    for (const row of res.rows) {
      const vehicle = row.vehicle_name || "Fahrzeug";
      const driver = row.user_name || "Fahrer";

      const description = [
        `Fahrzeug: ${vehicle}`,
        `Fahrer: ${driver}`,
        `Start-Km: ${row.start_km} km`,
        row.end_km ? `End-Km: ${row.end_km} km` : "",
        row.notes ? `Hinweise: ${row.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      calendar.createEvent({
        id: `reservation-${row.id}@autopark`,
        start: new Date(row.start_time),
        end: new Date(row.end_time),
        summary: `🚗 ${vehicle} - ${driver}`,
        description: description,
        location: "Malles Venosta",
        busystatus: ICalEventBusyStatus.BUSY,
      });
    }

    return new NextResponse(calendar.toString(), {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Errore generazione feed iCalendar:", error);
    return new NextResponse("Interner Serverfehler", { status: 500 });
  }
}