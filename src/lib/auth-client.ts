import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { validateEnv } from "./env";

// Fail-fast: validate required public env vars at import time (build + runtime)
validateEnv();

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
    plugins: [
        adminClient()
    ]
});

export const { signIn, signOut, useSession } = authClient;
