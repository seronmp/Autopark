"use client";

import { FormEvent, useEffect, useState } from "react";
import { BarChart3, BookOpenCheck, CalendarClock, Check, Copy, Download, Gauge, LoaderCircle, Wrench } from "lucide-react";

type Tab = "bookings" | "maintenance" | "logbook" | "reports";
type Reservation = {
  id: number;
  resource_id: number;
  vehicle_name: string;
  license_plate: string;
  user_name: string;
  start_time: string;
  end_time: string;
  start_km: number;
  end_km: number | null;
  notes: string | null;
  purpose: string | null;
  department: string | null;
  status: string;
};
type Vehicle = { id: number; name: string; plate: string; km: number; status: string };
type Maintenance = {
  id: number;
  resource_id: number;
  vehicle_name: string;
  license_plate: string;
  title: string;
  due_date: string;
  cost: number;
  notes: string | null;
  status: string;
  overdue: boolean;
};
type ReportData = {
  summary: Record<string, number | string>;
  vehicles: Array<Record<string, string | number>>;
  monthly: Array<{ month: string; bookings: number; distance_km: number }>;
};

const copy = {
  de: {
    title: "Fuhrparkverwaltung", subtitle: "Buchungen, Wartung und Fahrtennachweise an einem Ort.",
    bookings: "Buchungen", maintenance: "Wartung", logbook: "Fahrtenbuch", reports: "Auswertung",
    loading: "Daten werden geladen…", empty: "Keine Einträge vorhanden.", error: "Daten konnten nicht geladen werden.",
    driver: "Fahrer", vehicle: "Fahrzeug", period: "Zeitraum", purpose: "Fahrtzweck", status: "Status", actions: "Aktionen",
    booked: "Gebucht", completed: "Abgeschlossen", cancelled: "Storniert", cancel: "Stornieren", finish: "Fahrt abschließen",
    outlookWarning: "Buchung gespeichert, aber Outlook konnte nicht aktualisiert werden.",
    copyFeed: "Kalenderlink kopieren", copied: "Kalenderlink kopiert", feedLinkLabel: "Outlook-Abonnementlink",
    startKm: "Start-km", endKm: "End-km", kmPlaceholder: "Endstand", maintenanceTask: "Wartungsaufgabe",
    dueDate: "Fällig am", cost: "Kosten (€)", notes: "Notiz", addTask: "Wartung einplanen", markDone: "Erledigt",
    overdue: "Überfällig", dueSoon: "Demnächst fällig", export: "CSV exportieren", trips: "Fahrten", distance: "Gefahrene km",
    hours: "Gebuchte Stunden diesen Monat", vehicles: "Aktive Fahrzeuge", maintenanceDue: "Wartung bis 30 Tage",
    noVehicle: "Kein Fahrzeug", saved: "Änderung gespeichert.", saveError: "Änderung konnte nicht gespeichert werden.",
    mileageError: "End-km muss mindestens dem Start-km entsprechen.", all: "Alle", bookedStatus: "Offen", department: "Abteilung",
  },
  it: {
    title: "Gestione flotta", subtitle: "Prenotazioni, manutenzione e registro viaggi in un unico posto.",
    bookings: "Prenotazioni", maintenance: "Manutenzione", logbook: "Registro viaggi", reports: "Statistiche",
    loading: "Caricamento dati…", empty: "Nessun elemento presente.", error: "Impossibile caricare i dati.",
    driver: "Conducente", vehicle: "Veicolo", period: "Periodo", purpose: "Motivo del viaggio", status: "Stato", actions: "Azioni",
    booked: "Prenotato", completed: "Completato", cancelled: "Annullato", cancel: "Annulla", finish: "Completa viaggio",
    outlookWarning: "Prenotazione salvata, ma Outlook non è stato aggiornato.",
    copyFeed: "Copia link calendario", copied: "Link calendario copiato", feedLinkLabel: "Link per Outlook",
    startKm: "Km iniziali", endKm: "Km finali", kmPlaceholder: "Km finali", maintenanceTask: "Intervento di manutenzione",
    dueDate: "Scadenza", cost: "Costo (€)", notes: "Note", addTask: "Pianifica manutenzione", markDone: "Completata",
    overdue: "Scaduta", dueSoon: "In scadenza", export: "Esporta CSV", trips: "Viaggi", distance: "Km percorsi",
    hours: "Ore prenotate questo mese", vehicles: "Veicoli attivi", maintenanceDue: "Manutenzioni entro 30 giorni",
    noVehicle: "Nessun veicolo", saved: "Modifica salvata.", saveError: "Impossibile salvare la modifica.",
    mileageError: "I km finali devono essere maggiori o uguali ai km iniziali.", all: "Tutti", bookedStatus: "Aperto", department: "Reparto",
  },
};

function formatDate(value: string, lang: "de" | "it", withTime = false) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(lang === "de" ? "de-DE" : "it-IT", withTime
    ? { dateStyle: "short", timeStyle: "short" }
    : { dateStyle: "medium" }).format(date);
}

export default function FleetAdminWorkspace({ lang = "de", initialTab = "bookings" }: {
  lang?: "de" | "it";
  initialTab?: Tab;
}) {
  const t = copy[lang];
  const [tab, setTab] = useState<Tab>(initialTab);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [reports, setReports] = useState<ReportData | null>(null);
  const [endKm, setEndKm] = useState<Record<number, string>>({});
  const [task, setTask] = useState({ resourceId: "", title: "", dueDate: "", cost: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [feedUrl, setFeedUrl] = useState("");

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [bookingRes, vehicleRes, maintenanceRes, reportRes] = await Promise.all([
        fetch("/api/reservations", { cache: "no-store" }),
        fetch("/api/vehicles", { cache: "no-store" }),
        fetch("/api/maintenance", { cache: "no-store" }),
        fetch("/api/reports", { cache: "no-store" }),
      ]);
      const [bookingData, vehicleData, maintenanceData, reportData] = await Promise.all([
        bookingRes.json(), vehicleRes.json(), maintenanceRes.json(), reportRes.json(),
      ]);
      if (!bookingRes.ok || !vehicleRes.ok || !maintenanceRes.ok || !reportRes.ok) {
        throw new Error(bookingData.error || vehicleData.error || maintenanceData.error || reportData.error || t.error);
      }
      setReservations(bookingData.data || []);
      setVehicles(vehicleData || []);
      setMaintenance(maintenanceData.data || []);
      setReports(reportData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, []);

  async function updateReservation(id: number, status: "completed" | "cancelled", finalKm?: number) {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/reservations", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, endKm: finalKm }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.saveError);
      setMessage(data.calendarSynced === false ? `${t.saved} ${t.outlookWarning}` : t.saved);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t.saveError);
    } finally {
      setSaving(false);
    }
  }

  async function createMaintenance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/maintenance", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.saveError);
      setTask({ resourceId: "", title: "", dueDate: "", cost: "", notes: "" });
      setMessage(t.saved);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t.saveError);
    } finally {
      setSaving(false);
    }
  }

  async function completeMaintenance(id: number) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/maintenance", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "completed" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.saveError);
      setMessage(t.saved);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t.saveError);
    } finally {
      setSaving(false);
    }
  }

  async function copyCalendarFeedUrl() {
    setError("");
    try {
      const response = await fetch("/api/calendar/feed-url", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.error);
      setFeedUrl(data.url);
      await navigator.clipboard.writeText(data.url);
      setMessage(t.copied);
    } catch (feedError) {
      setError(feedError instanceof Error ? feedError.message : t.error);
    }
  }

  function exportCsv() {
    const headers = [t.vehicle, t.driver, t.period, t.purpose, t.department, t.startKm, t.endKm, t.status];
    const rows = reservations.map((booking) => [
      booking.vehicle_name, booking.user_name, `${booking.start_time} - ${booking.end_time}`,
      booking.purpose || "", booking.department || "", booking.start_km, booking.end_km ?? "", booking.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "autopark-fahrtenbuch.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof CalendarClock }> = [
    { id: "bookings", label: t.bookings, icon: CalendarClock },
    { id: "maintenance", label: t.maintenance, icon: Wrench },
    { id: "logbook", label: t.logbook, icon: BookOpenCheck },
    { id: "reports", label: t.reports, icon: BarChart3 },
  ];
  const activeBookings = reservations.filter((booking) => !["completed", "cancelled", "rejected"].includes(booking.status));
  const completedTrips = reservations.filter((booking) => booking.status === "completed");
  const summary = reports?.summary || {};
  const monthMax = Math.max(1, ...(reports?.monthly || []).map((month) => Number(month.bookings)));

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase text-emerald-700">Autopark / {t.title}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">{t.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => void copyCalendarFeedUrl()} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Copy className="h-4 w-4" />{t.copyFeed}
          </button>
          {tab === "logbook" && (
            <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-700">
              <Download className="h-4 w-4" />{t.export}
            </button>
          )}
        </div>
      </header>

      {feedUrl && (
        <label className="block max-w-full text-xs font-medium text-slate-600">
          {t.feedLinkLabel}
          <input readOnly value={feedUrl} onFocus={(event) => event.currentTarget.select()} className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 font-mono text-xs" />
        </label>
      )}

      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200" aria-label={t.title}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium ${tab === id ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-500 hover:text-slate-900"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </nav>

      {message && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
      {error && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />{t.loading}</div>
      ) : (
        <>
          {tab === "bookings" && (
            <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>
                  <th className="px-4 py-3">{t.vehicle}</th><th className="px-4 py-3">{t.driver}</th><th className="px-4 py-3">{t.period}</th><th className="px-4 py-3">{t.purpose}</th><th className="px-4 py-3">{t.status}</th><th className="px-4 py-3">{t.actions}</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {activeBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{booking.vehicle_name}<span className="block text-xs font-normal text-slate-500">{booking.license_plate}</span></td>
                      <td className="px-4 py-3">{booking.user_name}<span className="block text-xs text-slate-500">{booking.department || ""}</span></td>
                      <td className="px-4 py-3 text-xs">{formatDate(booking.start_time, lang, true)}<span className="block text-slate-500">– {formatDate(booking.end_time, lang, true)}</span></td>
                      <td className="max-w-48 px-4 py-3 text-slate-600">{booking.purpose || booking.notes || "–"}</td>
                      <td className="px-4 py-3"><span className="rounded-sm bg-blue-50 px-2 py-1 text-xs text-blue-800">{t.booked}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <input aria-label={`${t.endKm} ${booking.vehicle_name}`} type="number" min={booking.start_km} placeholder={t.kmPlaceholder} value={endKm[booking.id] || ""} onChange={(event) => setEndKm({ ...endKm, [booking.id]: event.target.value })} className="w-24 rounded border border-slate-300 px-2 py-1.5 text-xs" />
                          <button disabled={saving} onClick={() => {
                            const finalKm = Number(endKm[booking.id]);
                            if (!Number.isInteger(finalKm) || finalKm < booking.start_km) { setError(t.mileageError); return; }
                            void updateReservation(booking.id, "completed", finalKm);
                          }} title={t.finish} className="rounded bg-emerald-700 p-2 text-white hover:bg-emerald-800 disabled:opacity-50"><Check className="h-4 w-4" /></button>
                          <button disabled={saving} onClick={() => void updateReservation(booking.id, "cancelled")} className="rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50">{t.cancel}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!activeBookings.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">{t.empty}</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {tab === "maintenance" && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">{t.vehicle}</th><th className="px-4 py-3">{t.maintenanceTask}</th><th className="px-4 py-3">{t.dueDate}</th><th className="px-4 py-3">{t.cost}</th><th className="px-4 py-3">{t.status}</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{maintenance.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium">{item.vehicle_name}<span className="block text-xs font-normal text-slate-500">{item.license_plate}</span></td>
                      <td className="px-4 py-3">{item.title}<span className="block text-xs text-slate-500">{item.notes || ""}</span></td>
                      <td className="px-4 py-3">{formatDate(item.due_date, lang)}</td>
                      <td className="px-4 py-3">{Number(item.cost).toLocaleString(lang === "de" ? "de-DE" : "it-IT", { style: "currency", currency: "EUR" })}</td>
                      <td className="px-4 py-3">{item.status === "completed" ? <span className="text-emerald-700">{t.completed}</span> : <div className="flex items-center gap-2">{item.overdue ? <span className="text-rose-700">{t.overdue}</span> : <span className="text-amber-700">{t.dueSoon}</span>}<button disabled={saving} onClick={() => void completeMaintenance(item.id)} className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">{t.markDone}</button></div>}</td>
                    </tr>
                  ))}
                  {!maintenance.length && <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500">{t.empty}</td></tr>}</tbody>
                </table>
              </div>
              <form onSubmit={createMaintenance} className="h-fit space-y-3 border-t-2 border-emerald-700 bg-white p-4 shadow-sm">
                <h2 className="font-semibold text-slate-900">{t.addTask}</h2>
                <label className="block text-xs font-medium text-slate-600">{t.vehicle}
                  <select required value={task.resourceId} onChange={(event) => setTask({ ...task, resourceId: event.target.value })} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm">
                    <option value="">{t.noVehicle}</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name} · {vehicle.plate}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-medium text-slate-600">{t.maintenanceTask}<input required value={task.title} onChange={(event) => setTask({ ...task, title: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-medium text-slate-600">{t.dueDate}<input required type="date" value={task.dueDate} onChange={(event) => setTask({ ...task, dueDate: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-2 py-2 text-sm" /></label>
                  <label className="block text-xs font-medium text-slate-600">{t.cost}<input type="number" min="0" step="0.01" value={task.cost} onChange={(event) => setTask({ ...task, cost: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-2 py-2 text-sm" /></label>
                </div>
                <label className="block text-xs font-medium text-slate-600">{t.notes}<textarea rows={2} value={task.notes} onChange={(event) => setTask({ ...task, notes: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" /></label>
                <button disabled={saving || !vehicles.length} className="w-full rounded bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">{t.addTask}</button>
              </form>
            </div>
          )}

          {tab === "logbook" && (
            <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">{t.period}</th><th className="px-4 py-3">{t.vehicle}</th><th className="px-4 py-3">{t.driver}</th><th className="px-4 py-3">{t.purpose}</th><th className="px-4 py-3">{t.startKm} / {t.endKm}</th><th className="px-4 py-3">km</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{completedTrips.map((trip) => (
                  <tr key={trip.id}><td className="px-4 py-3">{formatDate(trip.start_time, lang, true)}</td><td className="px-4 py-3 font-medium">{trip.vehicle_name}</td><td className="px-4 py-3">{trip.user_name}<span className="block text-xs text-slate-500">{trip.department || ""}</span></td><td className="px-4 py-3">{trip.purpose || trip.notes || "–"}</td><td className="px-4 py-3 tabular-nums">{trip.start_km} / {trip.end_km}</td><td className="px-4 py-3 font-semibold tabular-nums">{Number(trip.end_km) - Number(trip.start_km)}</td></tr>
                ))}{!completedTrips.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">{t.empty}</td></tr>}</tbody>
              </table>
            </div>
          )}

          {tab === "reports" && (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  [t.trips, Number(summary.completed_trips || 0), <BookOpenCheck key="trips" className="h-4 w-4" />],
                  [t.distance, Number(summary.distance_km || 0).toLocaleString(), <Gauge key="distance" className="h-4 w-4" />],
                  [t.hours, Number(summary.hours_this_month || 0), <CalendarClock key="hours" className="h-4 w-4" />],
                  [t.vehicles, Number(summary.active_vehicles || 0), <BarChart3 key="vehicles" className="h-4 w-4" />],
                  [t.maintenanceDue, Number(summary.maintenance_due || 0), <Wrench key="maintenance" className="h-4 w-4" />],
                ].map(([label, value, icon]) => (
                  <div key={String(label)} className="border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500">{label}{icon}</div>
                    <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-950">{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-6 xl:grid-cols-2">
                <section className="border border-slate-200 bg-white p-5">
                  <h2 className="mb-5 font-semibold">{t.bookings}</h2>
                  <div className="space-y-4">{(reports?.monthly || []).map((month) => (
                    <div key={month.month} className="grid grid-cols-[70px_1fr_45px] items-center gap-3 text-xs">
                      <span className="text-slate-500">{month.month}</span>
                      <div className="h-2 bg-slate-100"><div className="h-full bg-emerald-700" style={{ width: `${Math.max(2, Number(month.bookings) / monthMax * 100)}%` }} /></div>
                      <span className="text-right tabular-nums text-slate-700">{month.bookings}</span>
                    </div>
                  ))}</div>
                </section>
                <section className="overflow-x-auto border border-slate-200 bg-white p-5">
                  <h2 className="mb-4 font-semibold">{t.vehicle}</h2>
                  <table className="w-full min-w-[420px] text-left text-xs"><thead className="text-slate-500"><tr><th className="pb-2">{t.vehicle}</th><th className="pb-2">{t.trips}</th><th className="pb-2">km</th><th className="pb-2">{t.cost}</th></tr></thead><tbody className="divide-y divide-slate-100">{(reports?.vehicles || []).map((vehicle) => <tr key={String(vehicle.id)}><td className="py-2 font-medium">{vehicle.name}</td><td className="py-2 tabular-nums">{vehicle.completed_trips}</td><td className="py-2 tabular-nums">{Number(vehicle.distance_km).toLocaleString()}</td><td className="py-2 tabular-nums">{Number(vehicle.maintenance_cost).toLocaleString(lang === "de" ? "de-DE" : "it-IT", { style: "currency", currency: "EUR" })}</td></tr>)}</tbody></table>
                </section>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}