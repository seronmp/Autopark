import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET: Legge tutti i veicoli dal DB Neon
export async function GET() {
  try {
    const res = await query(
      `SELECT id, name, COALESCE(plate, '') as plate, COALESCE(type, 'truck') as type, 
              COALESCE(current_km, 0) as km, COALESCE(status, 'available') as status 
       FROM resources 
       ORDER BY id ASC`
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Errore fetch vehicles:", error);
    return NextResponse.json({ error: "Errore caricamento mezzi" }, { status: 500 });
  }
}

// POST: Aggiunge un nuovo veicolo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, plate, type, km, status } = body;

    const res = await query(
      `INSERT INTO resources (name, plate, type, current_km, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, plate, type, current_km as km, status`,
      [name, plate || "", type || "car", Number(km) || 0, status || "available"]
    );

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error("Errore inserimento vehicle:", error);
    return NextResponse.json({ error: "Errore inserimento mezzo" }, { status: 500 });
  }
}

// PUT: Modifica/Rinomina un veicolo esistente
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, plate, type, km, status } = body;

    const res = await query(
      `UPDATE resources 
       SET name = $1, plate = $2, type = $3, current_km = $4, status = $5
       WHERE id = $6
       RETURNING id, name, plate, type, current_km as km, status`,
      [name, plate, type, Number(km), status, id]
    );

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error("Errore update vehicle:", error);
    return NextResponse.json({ error: "Errore modifica mezzo" }, { status: 500 });
  }
}

// DELETE: Elimina un veicolo
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID mancante" }, { status: 400 });

    await query(`DELETE FROM resources WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore eliminazione vehicle:", error);
    return NextResponse.json({ error: "Errore eliminazione mezzo" }, { status: 500 });
  }
}