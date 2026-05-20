import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";
import { validateEnv } from "./env";

// Fail-fast: validate server-side environment variables at module load time
validateEnv();

const globalForPool = globalThis as unknown as { pool: Pool | undefined };

// Always recreate pool to pick up config changes during HMR.
// End the stale cached pool (if any) in the background.
if (globalForPool.pool) {
    globalForPool.pool.end().catch(() => {});
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false },
});

if (process.env.NODE_ENV !== "production") {
    globalForPool.pool = pool;
}

export const auth = betterAuth({
    database: pool,
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    user: {
        modelName: "users",
        fields: {
            emailVerified: "email_verified",
            createdAt: "created_at",
            updatedAt: "updated_at",
            banned: "banned",
            banReason: "ban_reason",
            banExpires: "ban_expires",
        },
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
            },
            username: {
                type: "string",
                required: false,
            }
        }
    },
    session: {
        modelName: "sessions",
        fields: {
            userId: "user_id",
            expiresAt: "expires_at",
            ipAddress: "ip_address",
            userAgent: "user_agent",
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60
        }
    },
    account: {
        modelName: "accounts",
        fields: {
            userId: "user_id",
            accountId: "account_id",
            providerId: "provider_id",
            accessToken: "access_token",
            refreshToken: "refresh_token",
            idToken: "id_token",
            accessTokenExpiresAt: "access_token_expires_at",
            refreshTokenExpiresAt: "refresh_token_expires_at",
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    },
    verification: {
        modelName: "verifications",
        fields: {
            expiresAt: "expires_at",
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        admin()
    ],
    advanced: {
        database: {
            generateId: () => crypto.randomUUID()
        }
    }
});
