import FleetAdminWorkspace from "@/components/FleetAdminWorkspace";

const validTabs = ["bookings", "maintenance", "logbook", "reports"] as const;

export default async function ReservationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ lang: routeLang }, { tab }] = await Promise.all([params, searchParams]);
  const lang = routeLang === "it" ? "it" : "de";
  const initialTab = validTabs.includes(tab as (typeof validTabs)[number])
    ? (tab as (typeof validTabs)[number])
    : "bookings";

  return <FleetAdminWorkspace lang={lang} initialTab={initialTab} />;
}
