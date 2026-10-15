"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, CalendarDays, Clock, Wrench } from "lucide-react";

export default function SidebarNavigation() {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] === "de" ? "de" : "it";
  const labels = lang === "de"
    ? ["Neue Fahrt", "Buchungen", "Wartung", "Fahrtenbuch & Auswertung"]
    : ["Nuovo viaggio", "Prenotazioni", "Manutenzione", "Registro & statistiche"];
  const base = `/${lang}/reservations?tab=`;
  const links = [
    { href: `/${lang}`, label: labels[0], icon: Clock, active: pathname === `/${lang}` },
    { href: `${base}bookings`, label: labels[1], icon: CalendarDays, active: pathname.endsWith("/reservations") },
    { href: `${base}maintenance`, label: labels[2], icon: Wrench, active: false },
    { href: `${base}logbook`, label: labels[3], icon: BookOpenCheck, active: false },
  ];

  return (
    <nav className="space-y-1 p-4">
      {links.map(({ href, label, icon: Icon, active }) => (
        <Link key={href} href={href} aria-current={active ? "page" : undefined}
          className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${active ? "bg-blue-600/10 text-blue-400" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"}`}>
          <Icon className="h-4 w-4" />{label}
        </Link>
      ))}
    </nav>
  );
}