import LandingContent from "@/components/LandingContent";

export default function LandingPage() {
  return <LandingContent demoEmail={process.env.DEMO_REQUEST_EMAIL ?? "info@seron-app.com"} />;
}
