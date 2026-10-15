"use client";

import { CheckCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function WorkspaceStatus() {
  const pathname = usePathname();
  const isGerman = pathname.split("/")[1] === "de";

  return (
    <div className="p-4 border-t border-slate-800">
      <div className="bg-slate-800/60 rounded-xl p-3 text-xs space-y-1.5 border border-slate-700/50">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{isGerman ? "Outlook-Kalender" : "Calendario Outlook"}</span>
        </div>
        <p className="text-[11px] text-slate-400">
          {isGerman ? "Kalenderverbindung" : "Connessione calendario"}
        </p>
      </div>
    </div>
  );
}