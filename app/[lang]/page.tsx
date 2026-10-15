import Link from "next/link";
import ReservationBookingPanel from "@/components/ReservationBookingPanel";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = (resolvedParams.lang === "de" ? "de" : "it") as "it" | "de";

  return (
    <div className="w-full">
      {/* Selettore Lingua nell'header della pagina */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4 flex justify-end items-center gap-2">
        <span className="text-xs font-medium text-slate-400">Sprache / Lingua:</span>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
          <Link
            href="/it"
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
              lang === "it"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            IT
          </Link>
          <Link
            href="/de"
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
              lang === "de"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            DE
          </Link>
        </div>
      </div>

      {/* Pannello prenotazione */}
      <ReservationBookingPanel lang={lang} />
    </div>
  );
}