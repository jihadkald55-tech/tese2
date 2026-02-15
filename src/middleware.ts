import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Force dynamic rendering for dashboard routes
  if (pathname.startsWith("/dashboard")) {
    res.headers.set("Cache-Control", "no-store, must-revalidate");
    res.headers.set("CDN-Cache-Control", "no-store");
    res.headers.set("Vercel-CDN-Cache-Control", "no-store");
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/reset-password"],
};
