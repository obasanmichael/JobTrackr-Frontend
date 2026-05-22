import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth guard is client-side for MVP (localStorage token).
// This proxy passes all dashboard requests through, the AuthGuard
// component in the layout handles the actual redirect to /login.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
