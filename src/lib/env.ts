// src/lib/env.ts
// Validates all required environment variables at module-load time.
// Call `validateEnv()` early in your app lifecycle (see layout.tsx).

const REQUIRED_SERVER_VARS = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
] as const;

const REQUIRED_PUBLIC_VARS = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_BETTER_AUTH_URL",
] as const;

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

export function validateEnv() {
  const missing: string[] = [];

  for (const key of REQUIRED_SERVER_VARS) {
    const v = process.env[key];
    if (!v || v.trim() === "" || isPlaceholder(v)) {
      missing.push(key + " (server-side)");
    }
  }

  // Public vars are available at build-time; validate unconditionally.
  for (const key of REQUIRED_PUBLIC_VARS) {
    const v = process.env[key];
    if (!v || v.trim() === "" || isPlaceholder(v)) {
      missing.push(key + " (public)");
    }
  }

  if (missing.length > 0) {
    fail(missing);
  }
}
