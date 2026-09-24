import { NextRequest, NextResponse } from "next/server";

// ─── Lightweight Edge-compatible JWT decode (no verify — just decode for routing)
// Full cryptographic verification happens in API route handlers via lib/auth.ts
function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64url decode
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(payload: Record<string, unknown>): boolean {
  if (typeof payload.exp !== "number") return true;
  return Date.now() / 1000 > payload.exp;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJWTPayload(token);
    if (!payload || isTokenExpired(payload)) {
      const loginUrl = new URL("/admin/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("auth_token");
      return response;
    }

    // Inject user info into request headers for server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.userId || ""));
    requestHeaders.set("x-user-email", String(payload.email || ""));
    requestHeaders.set("x-user-name", String(payload.name || ""));
    requestHeaders.set("x-user-role", String(payload.role || ""));

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Redirect /admin/login to /admin/dashboard if already logged in
  if (pathname === "/admin/login" || pathname === "/admin") {
    const token = request.cookies.get("auth_token")?.value;
    if (token) {
      const payload = decodeJWTPayload(token);
      if (payload && !isTokenExpired(payload)) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }
  }

  // Redirect root to /portal (public landing)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
