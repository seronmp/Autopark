import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
    ? callbackUrl
    : "/de/reservations";

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4 py-12">
      <section className="w-full border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase text-emerald-700">Autopark · Administration</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Admin-Anmeldung</h1>
        <p className="mb-7 mt-1 text-sm text-slate-600">Melde dich an, um den Fuhrpark zu verwalten.</p>
        <LoginForm callbackUrl={safeCallbackUrl} />
      </section>
    </main>
  );
}