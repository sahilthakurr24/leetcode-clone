import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Route guards (Next 16 proxy, formerly middleware):
 *
 * - `/admin/*`    — admins only. Signed out → /signin, signed in non-admin → /.
 * - `/problems/*` — the solving workspace requires an account. Signed out → /signup.
 * - `/signin`, `/signup` — already-authenticated users are sent back into the app.
 *
 * The session is verified server-side on every guarded request by calling
 * better-auth's own `/api/auth/get-session` with the request cookies — a
 * forged or expired cookie yields no session, so cookie presence alone is
 * never trusted. `role` comes from that verified response, mirroring the
 * `adminProcedure` guard on the API itself.
 */

type Session = {
  user: { id: string; role: "user" | "admin" };
} | null;

async function getVerifiedSession(request: NextRequest): Promise<Session> {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;

  try {
    const response = await fetch(
      new URL("/api/auth/get-session", request.nextUrl.origin),
      { headers: { cookie }, cache: "no-store" },
    );
    if (!response.ok) return null;
    const session = (await response.json()) as Session;
    return session?.user ? session : null;
  } catch {
    // If the auth endpoint is unreachable, fail closed: treat as signed out.
    return null;
  }
}

/** Only allow same-origin path redirects — never a `next` pointing off-site. */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function redirectTo(request: NextRequest, pathname: string, next?: string) {
  const url = new URL(pathname, request.nextUrl.origin);
  if (next) url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await getVerifiedSession(request);
  const returnTo = `${pathname}${search}`;

  // Auth pages: nothing to do here when already signed in.
  if (pathname === "/signin" || pathname === "/signup") {
    if (session) {
      return redirectTo(
        request,
        safeNext(request.nextUrl.searchParams.get("next")),
      );
    }
    return NextResponse.next();
  }

  // Admin area: session + admin role, verified server-side.
  if (pathname.startsWith("/admin")) {
    if (!session) return redirectTo(request, "/signin", returnTo);
    if (session.user.role !== "admin") return redirectTo(request, "/");
    return NextResponse.next();
  }

  // Problem workspace: solving requires an account — sign up first.
  if (pathname.startsWith("/problems")) {
    if (!session) return redirectTo(request, "/signup", returnTo);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/problems/:path*", "/signin", "/signup"],
};
