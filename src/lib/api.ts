import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
// Better Auth manages session tokens via httpOnly cookies automatically.
// The browser sends the session cookie with every same-origin /api request
// — no manual token injection needed here.
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response Interceptor
// Since Better Auth handles session cookies, token refresh is managed
// server-side. On a 401 the user must re-authenticate via Better Auth.
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth helpers ──────────────────────────────────────────────────────────────

/**
 * getSessionLoose
 * Thin wrapper around `authClient.getSession()` that returns the raw session
 * object (which may be null) instead of throwing when not authenticated.
 * Used by pages that need the logged-in user's id without requring an explicit
 * session guard or a `useSession()` hook.
 */
export async function getSessionLoose() {
  const { data } = await (await import("@/lib/auth-client")).authClient.getSession();
  return data;
}

/**
 * getAccessToken
 * Returns a fresh JWT access token by calling the NVide token endpoint using
 * the Better Auth session cookie — never reads from or writes to localStorage.
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
 * getSessionAuthHeader
 * Convenience: returns `Authorization: Bearer <token>` for use when constructing
 * a custom fetch / WebSocket URL.
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
