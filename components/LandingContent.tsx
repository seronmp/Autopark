"use client";

import { useState } from "react";
import ProductTour from "@/components/ProductTour";

const copy = {
  de: {
    text: "Fahrzeugbuchung, Outlook-Abgleich, Wartung, Fahrtenbuch und Auswertung in einer App.",
    demo: "Request Demo",
    subject: "Request Demo",
  },
  it: {
    text: "Prenotazione veicoli, sincronizzazione Outlook, manutenzione, registro viaggi e statistiche in un'unica app.",
    demo: "Richiedi demo",
    subject: "Richiesta demo",
  },
};

export default function LandingContent({ demoEmail }: { demoEmail: string }) {
  const [lang, setLang] = useState<"de" | "it">("it");
  const t = copy[lang];

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="absolute right-4 top-4 flex overflow-hidden rounded-md border border-slate-300 text-xs font-semibold" role="group" aria-label="Language">
        {(["it", "de"] as const).map((code) => (
          <button key={code} onClick={() => setLang(code)} aria-pressed={lang === code} className={`px-3 py-1.5 ${lang === code ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
            {code.toUpperCase()}
          </button>
        ))}
      </div>
      <h1 className="text-3xl font-semibold text-slate-950">Autopark</h1>
      <p className="text-slate-600">{t.text}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ProductTour lang={lang} />
        <a href={`mailto:${demoEmail}?subject=${encodeURIComponent(t.subject)}`} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
          {t.demo}
        </a>
      </div>
    </main>
  );
}
