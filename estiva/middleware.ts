import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/register", "/payment/success", "/payment/fail"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    pathname === "/" ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("estiva-token")?.value;

  // No token → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Basic JWT expiry check (decode without verification)
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        const res = NextResponse.redirect(
          new URL("/login", request.url),
        );
        res.cookies.delete("estiva-token");
        return res;
      }
    }
  } catch {
    // Malformed token — redirect to login
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete("estiva-token");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
