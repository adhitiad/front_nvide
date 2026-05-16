import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
    database: pool,
    modelName: {
        user: "users", // Map ke tabel 'users' yang sudah ada
        session: "sessions",
        account: "accounts",
        verification: "verifications"
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
    plugins: [
        admin() // Memungkinkan pengelolaan Role (admin, user, host, agensi)
    ],
    user: {
        // Kita bisa menambahkan field kustom di sini jika diperlukan
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
            }
        }
    },
    // Konfigurasi session agar bisa dibaca oleh backend Go melalui cookie
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // 5 minutes
        }
    }
});
