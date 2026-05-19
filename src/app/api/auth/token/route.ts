import { NextResponse, NextRequest } from "next/server";
import { auth, pool } from "@/lib/auth";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Query database to get full user information, including role and role_id
    const dbRes = await pool.query(
      'SELECT id, username, email, role, role_id FROM users WHERE id = $1 LIMIT 1',
      [userId]
    );

    if (dbRes.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const dbUser = dbRes.rows[0];

    // F-003 guard: JWT_SECRET must be set in the environment; we never fall back to
    // a hardcoded string so that a JWT signed under a known key cannot be forged.
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 32) {
      console.error("[FATAL] JWT_SECRET is not set or too short — refusing to sign tokens");
      return NextResponse.json(
        { error: "Server misconfiguration: JWT_SECRET is not set" },
        { status: 500 }
      );
    }

    const now = Math.floor(Date.now() / 1000);

    // Access Token Claims (Go-compatible)
    const accessClaims = {
      user_id: dbUser.id,
      username: dbUser.username || "",
      email: dbUser.email,
      role: dbUser.role || "user",
      role_id: dbUser.role_id || "",
      iss: "nvide-live",
      sub: dbUser.id,
      iat: now,
      nbf: now,
      exp: now + 15 * 60, // 15 minutes access token expiry
    };

    const accessToken = jwt.sign(accessClaims, jwtSecret);

    // Refresh Token Claims (Go-compatible)
    const refreshClaims = {
      user_id: dbUser.id,
      username: dbUser.username || "",
      role: dbUser.role || "user",
      iss: "nvide-live",
      sub: dbUser.id,
      iat: now,
      nbf: now,
      exp: now + 7 * 24 * 60 * 60, // 7 days refresh token expiry
    };

    const refreshToken = jwt.sign(refreshClaims, jwtSecret);

    return NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: dbUser.id,
        username: dbUser.username || "",
        email: dbUser.email,
        role: dbUser.role || "user",
        is_verified: true,
      },
    });
  } catch (err: any) {
    console.error("Failed to generate JWT token:", err);
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}
