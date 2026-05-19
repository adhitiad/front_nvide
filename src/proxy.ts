import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "better-auth/types";

// Session cookie name used by Better Auth
const BETTER_AUTH_SESSION_COOKIE = "better-auth.session_token";

export default async function proxy(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";

  // If the session cookie is absent, treat the user as unauthenticated and
  // let Better Auth's own redirect logic handle sign-in pages.
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
                     request.nextUrl.pathname.startsWith("/register");

  if (!cookieHeader.includes(BETTER_AUTH_SESSION_COOKIE)) {
    if (isAuthPage) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify the session cookie with the Better Auth session endpoint
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: cookieHeader,
      },
      throw: false,
    }
  );

  if (!session) {
    if (isAuthPage) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
