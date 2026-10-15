"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CalendarCheck2,
  CarFront,
  Check,
  CircleHelp,
  Download,
  Pause,
  Play,
  Wrench,
  X,
} from "lucide-react";

const translations = {
  de: {
    open: "Funktionstour",
    title: "Autopark in 40 Sekunden",
    intro: "Die wichtigsten Abläufe als kurze Tour.",
    close: "Tour schließen",
    previous: "Vorheriger Schritt",
    next: "Nächster Schritt",
    pause: "Animation pausieren",
    play: "Animation fortsetzen",
    skip: "Tour überspringen",
    step: "Schritt",
    of: "von",
    slides: [
      { label: "Buchen", title: "Passendes Fahrzeug buchen", body: "Fahrzeug auswählen, Fahrer und Zeitraum eintragen und die Buchung bestätigen." },
      { label: "Outlook", title: "Termine mit Outlook abgleichen", body: "Mit Microsoft angemeldet, werden Buchungen direkt im Outlook-Kalender angelegt. Ohne Microsoft-Verbindung bleibt die Buchung in der App." },
      { label: "Wartung", title: "Wartung rechtzeitig planen", body: "Fälligkeiten und Kosten je Fahrzeug festhalten und erledigte Arbeiten markieren." },
      { label: "Fahrtenbuch", title: "Fahrten sauber abschließen", body: "Beim Fahrtabschluss Endkilometer eintragen. Die App aktualisiert den Kilometerstand und übernimmt die Fahrt ins Fahrtenbuch." },
      { label: "Auswertung", title: "Fuhrparkdaten auswerten", body: "Fahrten, Kilometer, Buchungsstunden und Wartungskosten überblicken und das Fahrtenbuch als CSV exportieren." },
    ],
    visual: {
      available: "Verfügbar",
      vehicle: "Transporter · BZ 482 EK",
      driver: "Fahrer",
      period: "Zeitraum",
      confirm: "Buchung bestätigen",
      linked: "Outlook verbunden",
      appointment: "Fahrzeug reserviert",
      calendar: "MITTWOCH · 14. OKT",
      maintenance: "Ölwechsel",
      due: "Fällig in 12 Tagen",
      cost: "Geplante Kosten",
      completed: "Erledigt",
      startKm: "Start-km",
      endKm: "End-km",
      tripDistance: "Strecke",
      totalTrips: "Fahrten",
      totalKm: "Kilometer",
      utilization: "Auslastung",
      csv: "CSV-Export",
    },
  },
  it: {
    open: "Tour delle funzioni",
    title: "Autopark in 40 secondi",
    intro: "Una breve visita ai flussi principali.",
    close: "Chiudi la visita",
    previous: "Passaggio precedente",
    next: "Passaggio successivo",
    pause: "Metti in pausa",
    play: "Riprendi animazione",
    skip: "Salta la visita",
    step: "Passaggio",
    of: "di",
    slides: [
      { label: "Prenotazioni", title: "Prenota il veicolo giusto", body: "Scegli il veicolo, inserisci conducente e periodo, poi conferma la prenotazione." },
      { label: "Outlook", title: "Sincronizza con Outlook", body: "Con l'accesso Microsoft, le prenotazioni vengono aggiunte al calendario Outlook. Senza connessione Microsoft, restano nell'app." },
      { label: "Manutenzione", title: "Pianifica la manutenzione", body: "Registra scadenze e costi per ogni veicolo e segna gli interventi completati." },
      { label: "Registro viaggi", title: "Completa ogni viaggio", body: "Inserisci i chilometri finali al rientro. L'app aggiorna il contachilometri e archivia il viaggio." },
      { label: "Statistiche", title: "Analizza la flotta", body: "Consulta viaggi, chilometri, ore prenotate e costi; esporta il registro in CSV." },
    ],
    visual: {
      available: "Disponibile",
      vehicle: "Furgone · BZ 482 EK",
      driver: "Conducente",
      period: "Periodo",
      confirm: "Conferma prenotazione",
      linked: "Outlook collegato",
      appointment: "Veicolo prenotato",
      calendar: "MERCOLEDÌ · 14 OTT",
      maintenance: "Cambio olio",
      due: "In scadenza tra 12 giorni",
      cost: "Costo previsto",
      completed: "Completato",
      startKm: "Km iniziali",
      endKm: "Km finali",
      tripDistance: "Percorso",
      totalTrips: "Viaggi",
      totalKm: "Chilometri",
      utilization: "Utilizzo",
      csv: "Esporta CSV",
    },
  },
};

function TourScene({ step, lang }: { step: number; lang: "de" | "it" }) {
  const t = translations[lang];
  const slide = t.slides[step];

  return (
    <div key={step} className="product-tour-scene relative flex min-h-[290px] items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-5 sm:min-h-[340px]">
      <div className="absolute inset-x-0 top-0 h-1 bg-slate-200">
        <div className="product-tour-scan h-full w-1/3 bg-emerald-600" />
      </div>

      {step === 0 && (
        <div className="w-full max-w-sm space-y-3">
          <div className="product-tour-card flex items-center gap-3 rounded-md border border-emerald-200 bg-white p-3 shadow-sm">
            <div className="rounded bg-emerald-50 p-2 text-emerald-800"><CarFront className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{t.visual.vehicle}</p><p className="mt-1 text-xs text-emerald-700">{t.visual.available}</p></div>
            <Check className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-2 w-32 rounded bg-slate-200" />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded border border-slate-200 p-2"><p className="text-[10px] text-slate-500">{t.visual.driver}</p><div className="mt-2 h-2 w-20 rounded bg-slate-300" /></div>
              <div className="rounded border border-slate-200 p-2"><p className="text-[10px] text-slate-500">{t.visual.period}</p><div className="mt-2 h-2 w-24 rounded bg-slate-300" /></div>
            </div>
            <div className="flex items-center justify-between rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white"><span>{t.visual.confirm}</span><ArrowRight className="h-3.5 w-3.5" /></div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="relative w-full max-w-sm">
          <div className="absolute left-[18%] top-1/2 h-px w-[64%] -translate-y-1/2 bg-emerald-300" />
          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-700"><CarFront className="h-4 w-4 text-emerald-700" />Autopark</div>
              <div className="h-2 w-full rounded bg-slate-100" /><div className="mt-2 h-2 w-2/3 rounded bg-slate-100" />
            </div>
            <div className="relative z-10 rounded-full bg-emerald-700 p-2 text-white"><ArrowRight className="h-4 w-4" /></div>
            <div className="rounded-md border border-blue-200 bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-700"><CalendarCheck2 className="h-4 w-4 text-blue-700" />Outlook</div>
              <div className="rounded bg-blue-50 p-2"><p className="text-[9px] font-semibold text-blue-800">{t.visual.calendar}</p><p className="mt-1 text-[10px] text-slate-700">{t.visual.appointment}</p></div>
            </div>
          </div>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-800"><Check className="h-3.5 w-3.5" />{t.visual.linked}</p>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3"><div className="rounded bg-amber-50 p-2 text-amber-800"><Wrench className="h-5 w-5" /></div><div><p className="text-sm font-semibold text-slate-900">{t.visual.maintenance}</p><p className="mt-1 text-xs text-slate-500">{t.visual.vehicle}</p></div></div>
            <span className="rounded-sm bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-800">{t.visual.due}</span>
          </div>
          <div className="my-4 h-2 overflow-hidden rounded bg-slate-100"><div className="product-tour-scan h-full w-3/4 bg-amber-500" /></div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs"><span className="text-slate-500">{t.visual.cost}</span><span className="font-semibold text-slate-800">€ 145,00</span></div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700"><Check className="h-3.5 w-3.5" />{t.visual.completed}</div>
        </div>
      )}

      {step === 3 && (
        <div className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><BookOpenCheck className="h-4 w-4 text-emerald-700" />{slide.label}</div><span className="text-[10px] text-slate-500">14.10.2026</span></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded border border-slate-200 p-3"><p className="text-[10px] text-slate-500">{t.visual.startKm}</p><p className="mt-2 font-mono text-sm font-semibold">84 210</p></div>
            <div className="rounded border border-emerald-200 bg-emerald-50/40 p-3"><p className="text-[10px] text-slate-500">{t.visual.endKm}</p><p className="product-tour-mileage mt-2 font-mono text-sm font-semibold text-emerald-800">84 268</p></div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs"><span className="text-slate-500">{t.visual.tripDistance}</span><span className="font-semibold text-slate-900">58 km</span></div>
        </div>
      )}

      {step === 4 && (
        <div className="w-full max-w-sm space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[[t.visual.totalTrips, "24"], [t.visual.totalKm, "1 840"], [t.visual.utilization, "78 %"]].map(([label, value]) => (
              <div key={label} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm"><p className="truncate text-[9px] text-slate-500">{label}</p><p className="mt-2 text-lg font-semibold tabular-nums text-slate-900">{value}</p></div>
            ))}
          </div>
          <div className="flex h-24 items-end gap-2 rounded-md border border-slate-200 bg-white px-4 pb-3 pt-4 shadow-sm">
            {[35, 54, 42, 76, 61, 91, 68, 84].map((height, index) => <div key={index} className="product-tour-bar flex-1 rounded-t-sm bg-emerald-600" style={{ height: `${height}%`, animationDelay: `${index * 60}ms` }} />)}
          </div>
          <div className="flex items-center justify-between rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white"><span>{t.visual.csv}</span><Download className="h-3.5 w-3.5" /></div>
        </div>
      )}
    </div>
  );
}

function TourVisual({ step, lang }: { step: number; lang: "de" | "it" }) {
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  if (failed[step]) return <TourScene step={step} lang={lang} />;
  return (
    <div className="flex min-h-[290px] items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 sm:min-h-[340px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={step} src={`/tour/step-${step + 1}.png`} alt={translations[lang].slides[step].title} onError={() => setFailed((current) => ({ ...current, [step]: true }))} className="max-h-[420px] w-full object-contain" />
    </div>
  );
}

export default function ProductTour({ lang: forcedLang }: { lang?: "de" | "it" } = {}) {
  const pathname = usePathname();
  const lang = forcedLang ?? (pathname.split("/")[1] === "de" ? "de" : "it");
  const t = translations[lang];
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [step, setStep] = useState(0);
  const slides = t.slides;

  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const timer = window.setTimeout(() => {
      if (step === slides.length - 1) setIsPlaying(false);
      else setStep(step + 1);
    }, 5200);
    return () => window.clearTimeout(timer);
  }, [isOpen, isPlaying, slides.length, step]);

  function openTour() {
    setStep(0);
    setIsPlaying(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setIsOpen(true);
  }

  function closeTour() {
    setIsOpen(false);
    setIsPlaying(false);
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTour();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button onClick={openTour} aria-haspopup="dialog" aria-expanded={isOpen} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:text-sm">
        <CircleHelp className="h-4 w-4" />
        <span>{t.open}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeTour(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="product-tour-title" className="product-tour-panel max-h-[calc(100dvh-24px)] w-full max-w-5xl overflow-y-auto rounded-md border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-48px)]">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
              <div><p className="text-xs font-semibold uppercase text-emerald-700">Autopark · {t.step} {step + 1} {t.of} {slides.length}</p><h2 id="product-tour-title" className="mt-1 text-xl font-semibold text-slate-950 sm:text-2xl">{t.title}</h2><p className="mt-1 text-sm text-slate-600">{t.intro}</p></div>
              <button onClick={closeTour} aria-label={t.close} title={t.close} className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </header>

            <div className="grid md:grid-cols-[minmax(0,1fr)_300px]">
              <div className="p-4 sm:p-7"><TourVisual step={step} lang={lang} /></div>
              <aside className="flex flex-col border-t border-slate-200 bg-white p-5 md:border-l md:border-t-0 sm:p-7">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase text-emerald-700">{slides[step].label}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{slides[step].title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{slides[step].body}</p>
                  <div className="mt-6 flex gap-1.5" aria-label={`${t.step} ${step + 1} ${t.of} ${slides.length}`}>
                    {slides.map((slide, index) => <button key={slide.label} onClick={() => { setStep(index); setIsPlaying(false); }} aria-label={`${t.step} ${index + 1}: ${slide.label}`} aria-current={index === step ? "step" : undefined} className={`h-1.5 flex-1 rounded-full transition-colors ${index === step ? "bg-emerald-700" : index < step ? "bg-emerald-300" : "bg-slate-200"}`} />)}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <button onClick={() => { setStep(Math.max(0, step - 1)); setIsPlaying(false); }} disabled={step === 0} aria-label={t.previous} title={t.previous} className="rounded border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 disabled:opacity-40"><ArrowLeft className="h-4 w-4" /></button>
                  <div className="flex gap-2">
                    <button onClick={() => setIsPlaying(!isPlaying)} aria-label={isPlaying ? t.pause : t.play} title={isPlaying ? t.pause : t.play} className="rounded border border-slate-300 p-2 text-slate-700 hover:bg-slate-50">{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
                    {step === slides.length - 1 ? (
                      <button onClick={closeTour} className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">{lang === "de" ? "Fertig" : "Fine"}</button>
                    ) : (
                      <button onClick={() => { setStep(step + 1); setIsPlaying(false); }} aria-label={t.next} title={t.next} className="rounded bg-slate-900 p-2 text-white hover:bg-slate-700"><ArrowRight className="h-4 w-4" /></button>
                    )}
                    <button onClick={closeTour} className="rounded px-2 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100">{t.skip}</button>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      )}
    </>
  );
}