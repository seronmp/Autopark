"use client";

import { useState } from "react";

interface Props {
  resourceId: number;
  vehicle: string;
  lang: "it" | "de";
}

export default function ReservationModal({ resourceId, vehicle, lang }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [startKm, setStartKm] = useState("");
  const [endKm, setEndKm] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId,
          vehicle,
          startDateTime,
          endDateTime,
          startKm: Number(startKm),
          endKm: endKm ? Number(endKm) : null,
          notes,
          title: `Fahrzeugreservierung: ${vehicle}`
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler beim Speichern");

      alert(lang === "de" ? "Erfolgreich gebucht und in Outlook synchronisiert!" : "Prenotazione salvata e sincronizzata!");
      setIsModalOpen(false);
      setStartDateTime(""); setEndDateTime(""); setStartKm(""); setEndKm(""); setNotes("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
      >
        {lang === "de" ? "Ressource buchen" : "Prenota Risorsa"}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {lang === "de" ? `Fahrzeug buchen: ${vehicle}` : `Prenota risorsa: ${vehicle}`}
            </h2>

            <form onSubmit={handleReservationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {lang === "de" ? "Startdatum & Uhrzeit" : "Data e Ora Inizio"}
                </label>
                <input 
                  type="datetime-local" 
                  required
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {lang === "de" ? "Enddatum & Uhrzeit" : "Data e Ora Fine"}
                </label>
                <input 
                  type="datetime-local" 
                  required
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {lang === "de" ? "Start-Kilometerstand" : "Km Iniziali"}
                  </label>
                  <input 
                    type="number" 
                    required
                    value={startKm}
                    onChange={(e) => setStartKm(e.target.value)}
                    placeholder="es. 45000"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {lang === "de" ? "End-Kilometerstand (optional)" : "Km Finali (opzionale)"}
                  </label>
                  <input 
                    type="number" 
                    value={endKm}
                    onChange={(e) => setEndKm(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {lang === "de" ? "Wichtige Hinweise (Strafzettl / Unfall)" : "Note Importanti (Multe / Incidenti)"}
                </label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {lang === "de" ? "Abbrechen" : "Annulla"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading 
                    ? (lang === "de" ? "Wird gespeichert..." : "Salvataggio in corso...") 
                    : (lang === "de" ? "Reservieren & Outlook sync" : "Conferma e Sincronizza")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}