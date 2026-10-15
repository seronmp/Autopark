import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const MARKETING_HOSTS = ["seron-app.com", "www.seron-app.com"];

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (MARKETING_HOSTS.includes(host)) {
    if (request.nextUrl.pathname === "/landing") return NextResponse.next();
    return NextResponse.rewrite(new URL("/landing", request.url));
  }

  const { pathname } = request.nextUrl;
  const isProtected = /^\/(de|it)(\/|$)|^\/api\/(reservations|resources|vehicles|maintenance|reports)(\/|$)/.test(pathname);
  if (!isProtected) return NextResponse.next();

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (token) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)"],
};
