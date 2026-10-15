"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", { email, password, callbackUrl, redirect: false });
      if (result?.error) {
        setError("E-Mail-Adresse oder Passwort ist falsch.");
        return;
      }
      router.push(result?.url || callbackUrl);
      router.refresh();
    } catch {
      setError("Anmeldung derzeit nicht möglich. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          E-Mail
          <input
            required
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Passwort
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
          />
        </label>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <button disabled={loading} className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
          {loading ? "Anmeldung läuft…" : "Mit E-Mail anmelden"}
        </button>
      </form>
      <div className="relative py-1 text-center text-xs text-slate-400">
        <span className="bg-white px-2">oder Outlook verbinden</span>
      </div>
      <button onClick={() => void signIn("azure-ad", { callbackUrl })} className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
        Mit Microsoft anmelden
      </button>
    </div>
  );
}