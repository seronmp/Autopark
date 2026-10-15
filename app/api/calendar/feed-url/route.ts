import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const sessionToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!sessionToken) {
    return NextResponse.json({ error: "Bitte zuerst anmelden." }, { status: 401 });
  }

  const feedToken = process.env.CALENDAR_FEED_TOKEN;
  if (!feedToken) {
    return NextResponse.json({ error: "Kalender-Feed ist nicht konfiguriert." }, { status: 503 });
  }

  const feedUrl = new URL("/api/calendar/feed", process.env.NEXTAUTH_URL || req.nextUrl.origin);
  feedUrl.searchParams.set("token", feedToken);
  return NextResponse.json(
    { url: feedUrl.toString() },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}