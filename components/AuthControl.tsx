"use client";

import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthControl() {
  const router = useRouter();
  const pathname = usePathname();
  const lang = pathname.split("/")[1] === "de" ? "de" : "it";
  const [email, setEmail] = useState<string | null>(null);
  const [authProvider, setAuthProvider] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((session) => {
        setEmail(session.user?.email || null);
        setAuthProvider(session.authProvider || null);
      })
      .catch(() => setEmail(null));
  }, []);

  if (!email) {
    return (
      <Link href="/login" className="rounded-md bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-700">
        {lang === "de" ? "Admin anmelden" : "Accesso amministratore"}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-xs text-slate-600 sm:block">{email}</span>
      {authProvider === "azure-ad" ? (
        <span className="hidden text-xs font-medium text-emerald-700 sm:block">
          {lang === "de" ? "Outlook verbunden" : "Outlook collegato"}
        </span>
      ) : (
        <button
          onClick={() => void signIn("azure-ad", { callbackUrl: pathname === "/login" ? "/de/reservations" : pathname })}
          className="rounded-md border border-blue-300 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-50"
        >
          {lang === "de" ? "Mit Microsoft anmelden" : "Accedi con Microsoft"}
        </button>
      )}
      <button
        onClick={async () => {
          await signOut({ redirect: false });
          setEmail(null);
          setAuthProvider(null);
          router.push("/login");
          router.refresh();
        }}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        {lang === "de" ? "Abmelden" : "Esci"}
      </button>
    </div>
  );
}