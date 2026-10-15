import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT m.id, m.resource_id, m.title, m.due_date, m.cost, m.notes, m.status,
              m.completed_at, r.name AS vehicle_name, r.plate AS license_plate,
              (m.status <> 'completed' AND m.due_date < CURRENT_DATE) AS overdue
       FROM maintenance_records m
       JOIN resources r ON r.id = m.resource_id
       ORDER BY (m.status = 'completed'), m.due_date ASC`
    );
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error("Wartungsaufgaben konnten nicht geladen werden:", error);
    return NextResponse.json({ error: "Wartungsaufgaben konnten nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { resourceId, title, dueDate, cost, notes } = await req.json();
    if (!Number.isInteger(Number(resourceId)) || !String(title || "").trim() ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dueDate || "") || !Number.isFinite(Number(cost || 0))) {
      return NextResponse.json({ error: "Bitte Fahrzeug, Aufgabe und gültiges Fälligkeitsdatum angeben." }, { status: 400 });
    }
    const result = await query(
      `INSERT INTO maintenance_records (resource_id, title, due_date, cost, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, resource_id, title, due_date, cost, notes, status, completed_at`,
      [Number(resourceId), String(title).trim(), dueDate, Number(cost || 0), notes || null]
    );
    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Wartungsaufgabe konnte nicht angelegt werden:", error);
    return NextResponse.json({ error: "Wartungsaufgabe konnte nicht angelegt werden." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!Number.isInteger(Number(id)) || status !== "completed") {
      return NextResponse.json({ error: "Ungültige Wartungsaktion." }, { status: 400 });
    }
    const result = await query(
      `UPDATE maintenance_records
       SET status = 'completed', completed_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, status, completed_at`,
      [Number(id)]
    );
    if (!result.rowCount) return NextResponse.json({ error: "Wartungseintrag nicht gefunden." }, { status: 404 });
    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Wartungsaufgabe konnte nicht aktualisiert werden:", error);
    return NextResponse.json({ error: "Wartungsaufgabe konnte nicht aktualisiert werden." }, { status: 500 });
  }
}