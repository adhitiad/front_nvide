import axios from "axios";
import { authClient } from "@/lib/auth-client";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── In-memory token cache ────────────────────────────────────────────────────
let _cachedToken: string | null = null;
let _tokenExpiresAt = 0; // epoch ms

async function getCachedAccessToken(): Promise<string | null> {
  // Return cached token if still valid (with 60s margin)
  if (_cachedToken && Date.now() < _tokenExpiresAt - 60_000) {
    return _cachedToken;
  }
  try {
    const res = await fetch("/api/auth/token", { credentials: "include" });
    if (!res.ok) return null;
    const body = await res.json();
    _cachedToken = body.access_token || null;
    // Token expires in 15 min; cache for ~14 min
    _tokenExpiresAt = Date.now() + 14 * 60 * 1000;
    return _cachedToken;
  } catch {
    return null;
  }
}

// Request Interceptor — attach JWT Bearer token for the Go backend.
api.interceptors.request.use(
  async (config) => {
    const token = await getCachedAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — unwrap the standardised envelope { success, data, error }.
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Check Better Auth session before hard-redirecting.
      // Only redirect if there truly is no active session.
      try {
        const session = await authClient.getSession();
        if (!session?.data) {
          window.location.href = "/login";
        }
      } catch {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth helpers ──────────────────────────────────────────────────────────────

/**
 * getSessionLoose returns the raw Better Auth session object (may be null).
 */
export async function getSessionLoose() {
  const { data } = await (await import("@/lib/auth-client")).authClient.getSession();
  return data;
}

/**
 * getAccessToken fetches a fresh JWT access token via the Better Auth token endpoint.
 */
export async function getAccessToken(): Promise<string> {
  const res = await fetch("/api/auth/token", {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status}`);
  }
  const body = await res.json();
  return body.access_token as string;
}

/**
 * getSessionAuthHeader returns an Authorization header for WebSocket / custom fetch.
 */
export async function getSessionAuthHeader(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return { Authorization: `Bearer ${token}` };
}

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res;
}

export async function register(username: string, email: string, password: string) {
  const res = await api.post("/auth/register", { username, email, password });
  return res;
}
