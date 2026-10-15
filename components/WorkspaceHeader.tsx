"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AuthControl from "@/components/AuthControl";
import ProductTour from "@/components/ProductTour";

export default function WorkspaceHeader() {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] === "de" ? "de" : "it";

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
        {lang === "de" ? "Fuhrparkverwaltung" : "Pannello operatore"}
      </span>
      <div className="flex items-center gap-2 sm:gap-3">
        <ProductTour />
        <AuthControl />
      </div>
    </header>
  );
}