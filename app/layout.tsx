import "./globals.css";
import React from "react";
import SidebarNavigation from "@/components/SidebarNavigation";
import WorkspaceHeader from "@/components/WorkspaceHeader";
import WorkspaceStatus from "@/components/WorkspaceStatus";
import { Car } from "lucide-react";

export const metadata = {
  title: "Autopark - Fleet & Vehicle Management",
  description: "Gestione prenotazioni e flotta aziendale sincronizzata con Outlook",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex antialiased">
        {/* SIDEBAR LATERALE FISSA */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between hidden md:flex border-r border-slate-800">
          <div>
            {/* Logo / Brand */}
            <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold tracking-tight text-base block leading-none">Autopark</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Fleet System</span>
              </div>
            </div>

            <SidebarNavigation />
          </div>

          <WorkspaceStatus />
        </aside>

        {/* AREA PRINCIPALE (HEADER + CONTENUTO PAGINA) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header superiore */}
          <WorkspaceHeader />

          {/* Pagina effettiva (il form di inserimento) */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}