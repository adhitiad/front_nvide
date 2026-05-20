import { randomBytes } from "crypto";

// src/lib/env.ts
// Validates all required environment variables at module-load time.
// In development mode, missing or placeholder values are auto-generated so
// the dev server never crashes.  In production, build-time mismatch is
// still treated as an error by the throw at the bottom of the file.

// ── Helper ─────────────────────────────────────────────────────────────────────

const SECRET_PLACEHOLDER_PATTERNS = [
  "REPLACE_WITH",
  "GENERATE_",
  "YOUR_",
  "CHANGE_THIS",
];

function isPlaceholder(value: string): boolean {
  const upper = value.toUpperCase();
  return SECRET_PLACEHOLDER_PATTERNS.some((p) => upper.includes(p));
}

function fail(missing: string[]) {
  throw new Error(
    `[NVide ENV] Missing or placeholder environment variables detected:\n  ${missing.join(
      "\n  "
    )}\n\nSet real values before deploying to production.`
  );
}

// ── Dev-safe defaults ─────────────────────────────────────────────────────────

/** Generate a opaque 32-byte string suitable for a secret key. */
function genSecret(): string {
  return randomBytes(32)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Fill every required server- and public- env-var in `process.env` when it is
 * missing, blank, or looks like a placeholder, but only when NODE_ENV is not
 * "production".
 */
function ensureDevEnv(): void {
  if (process.env.NODE_ENV === "production") return;

  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!apiUrl || isPlaceholder(apiUrl)) {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080/api/v1";
  }

  const betterAuthUrl = process.env.BETTER_AUTH_URL?.trim();
  if (!betterAuthUrl || isPlaceholder(betterAuthUrl)) {
    process.env.BETTER_AUTH_URL = origin;
  }

  const pubBetterAuth = process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.trim();
  if (!pubBetterAuth || isPlaceholder(pubBetterAuth)) {
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL = origin || "http://localhost:3000";
  }

  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret || isPlaceholder(secret)) {
    process.env.BETTER_AUTH_SECRET = genSecret();
  }

  // DATABASE_URL is deliberately NOT auto-generated here.
  // auth.ts (server-side) passes this string directly to pg.Pool, which requires
  // a real PostgreSQL (or compatible) connection string at startup time.
  // Only warn on the server — DATABASE_URL is never exposed to the browser.
  if (typeof window === "undefined") {
    const dbUrl = process.env.DATABASE_URL?.trim();
    if (!dbUrl || isPlaceholder(dbUrl)) {
      console.warn(
        "\x1b[33m[NVide ENV] DATABASE_URL is not set.\x1b[0m\n" +
          "  auth.ts uses pg.Pool with this value at startup.\n" +
          "  Add a real Postgres/Neon/Supabase pooler URL to .env.local, for example:\n" +
          '    DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require\n' +
          "  The dev server will not crash on DATABASE_URL alone, but auth.ts will\n" +
          "  fail as soon as it is imported (server API routes, middleware, etc.).\n"
      );
    }
  }

  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret || isPlaceholder(jwtSecret)) {
    process.env.JWT_SECRET = genSecret();
  }
}

// ── Public validation ─────────────────────────────────────────────────────────

const REQUIRED_SERVER_VARS = [
  // "DATABASE_URL" is handled by a console warning in `ensureDevEnv()`
  // because auth.ts passes it directly to pg.Pool which requires a live Postgres
  // connection at startup time; the error is not fixable via placeholder injection.
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
] as const;

const REQUIRED_PUBLIC_VARS = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_BETTER_AUTH_URL",
] as const;

function getEnvValue(key: string): string | undefined {
  switch (key) {
    case "DATABASE_URL":
      return process.env.DATABASE_URL;
    case "BETTER_AUTH_SECRET":
      return process.env.BETTER_AUTH_SECRET;
    case "BETTER_AUTH_URL":
      return process.env.BETTER_AUTH_URL;
    case "NEXT_PUBLIC_API_URL":
      return process.env.NEXT_PUBLIC_API_URL;
    case "NEXT_PUBLIC_BETTER_AUTH_URL":
      return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
    case "NEXT_PUBLIC_WS_URL":
      return process.env.NEXT_PUBLIC_WS_URL;
    case "JWT_SECRET":
      return process.env.JWT_SECRET;
    default:
      return process.env[key];
  }
}

export function validateEnv() {
  // Self-heal in dev so the dev server always starts.
  ensureDevEnv();

  const missing: string[] = [];
  const isServer = typeof window === "undefined";

  if (isServer) {
    for (const key of REQUIRED_SERVER_VARS) {
      const v = getEnvValue(key);
      if (!v || v.trim() === "" || isPlaceholder(v)) {
        missing.push(key + " (server-side)");
      }
    }
  }

  for (const key of REQUIRED_PUBLIC_VARS) {
    const v = getEnvValue(key);
    if (!v || v.trim() === "" || isPlaceholder(v)) {
      missing.push(key + " (public)");
    }
  }

  if (missing.length > 0) {
    fail(missing);
  }
}
