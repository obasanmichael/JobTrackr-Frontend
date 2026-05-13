import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes through
  if (PUBLIC_PATHS.some((p) => pathname === p) || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Protect /dashboard/* routes
  if (pathname.startsWith("/dashboard")) {
    // Token check is client-side only (localStorage); middleware just checks
    // for our cookie-based fallback or lets the client redirect.
    // For MVP, we rely on client-side auth guard in layout.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
