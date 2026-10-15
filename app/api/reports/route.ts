import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const [summary, vehicles, monthly] = await Promise.all([
      query(
        `SELECT
           COUNT(*) FILTER (WHERE status NOT IN ('cancelled', 'rejected'))::int AS bookings,
           COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_trips,
           COALESCE(SUM(end_km - start_km) FILTER (WHERE status = 'completed' AND end_km >= start_km), 0)::int AS distance_km,
           COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600)
             FILTER (WHERE status NOT IN ('cancelled', 'rejected') AND start_time >= date_trunc('month', CURRENT_DATE)), 0)::numeric(12,1) AS hours_this_month,
           (SELECT COUNT(*)::int FROM resources WHERE COALESCE(is_active, TRUE)) AS active_vehicles,
           (SELECT COUNT(*)::int FROM maintenance_records WHERE status <> 'completed' AND due_date <= CURRENT_DATE + INTERVAL '30 days') AS maintenance_due
         FROM reservations`
      ),
      query(
        `SELECT r.id, r.name, COALESCE(r.plate, '') AS plate,
                COUNT(b.id) FILTER (WHERE b.status = 'completed')::int AS completed_trips,
                COALESCE(SUM(b.end_km - b.start_km) FILTER (WHERE b.status = 'completed' AND b.end_km >= b.start_km), 0)::int AS distance_km,
                COALESCE(m.cost, 0)::numeric(12,2) AS maintenance_cost
         FROM resources r
         LEFT JOIN reservations b ON b.resource_id = r.id
         LEFT JOIN (
           SELECT resource_id, SUM(cost) AS cost FROM maintenance_records GROUP BY resource_id
         ) m ON m.resource_id = r.id
         GROUP BY r.id, r.name, r.plate, m.cost
         ORDER BY distance_km DESC, r.name`
      ),
      query(
        `SELECT to_char(months.month, 'YYYY-MM') AS month,
                COUNT(r.id)::int AS bookings,
                COALESCE(SUM(r.end_km - r.start_km) FILTER (WHERE r.status = 'completed' AND r.end_km >= r.start_km), 0)::int AS distance_km
         FROM generate_series(date_trunc('month', CURRENT_DATE) - INTERVAL '5 months', date_trunc('month', CURRENT_DATE), INTERVAL '1 month') AS months(month)
         LEFT JOIN reservations r ON r.start_time >= months.month AND r.start_time < months.month + INTERVAL '1 month'
           AND r.status NOT IN ('cancelled', 'rejected')
         GROUP BY months.month ORDER BY months.month`
      ),
    ]);

    return NextResponse.json({ summary: summary.rows[0], vehicles: vehicles.rows, monthly: monthly.rows });
  } catch (error) {
    console.error("Berichtsdaten konnten nicht geladen werden:", error);
    return NextResponse.json({ error: "Berichtsdaten konnten nicht geladen werden." }, { status: 500 });
  }
}