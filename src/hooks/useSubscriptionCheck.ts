// src/hooks/useSubscriptionCheck.ts
// Frontend subscription validation helper.
// Calls the backend to confirm that a storage_id is entitled (subscription
// active or DRM token approved) before a presigned URL is handed to the
// player / download component.  All actual enforcement lives server-side;
// this hook provides only a fast pre-check so the UI can show a paywall
// without unnecessarily reaching for a presigned URL.

import { useCallback, useRef, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────

export type SubscriptionTier = "free" | "vip1" | "vip2" | "vip3" | "expired";

export interface SubscriptionCheckResult {
  entitled: boolean;          // user may access this file
  tier: SubscriptionTier;
  quotaRemaining: number;
  quotaTotal: number;
  expiresAt: string | null;
  reason?: string;             // non-empty when !entitled
}

export interface UseSubscriptionCheckOptions {
  /** Auto-check on mount (default: true) */
  autoCheck?: boolean;
  /** Called the moment a fresh entitlement check succeeds */
  onEntitled?: (result: SubscriptionCheckResult) => void;
  /** Called the moment a check fails */
  onDenied?: (result: SubscriptionCheckResult) => void;
}

// ── Public helpers ─────────────────────────────────────────────────────────────

/** Brief label for display in a paywall CTA */
export function tierLabel(tier: SubscriptionTier): string {
  switch (tier) {
    case "free":     return "Free";
    case "vip1":     return "VIP 1";
    case "vip2":     return "VIP 2";
    case "vip3":     return "VIP 3";
    case "expired":  return "Expired";
  }
}

/** Promotional price for first-time host VIP upgrade */
export function promoPriceLabel(tier: SubscriptionTier): string | null {
  switch (tier) {
    case "vip1": return "Rp 15.678";   // first-time host promo
    case "vip2": return "Rp 45.999";
    case "vip3": return "Rp 89.999";
    default:     return null;
  }
}

/** Full price (no promo) */
export function fullPriceLabel(tier: SubscriptionTier): string | null {
  switch (tier) {
    case "vip1": return "Rp 49.999";
    case "vip2": return "Rp 89.999";
    case "vip3": return "Rp 159.999";
    default:     return null;
  }
}

// Format a date string into a short display label
function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Backend call ───────────────────────────────────────────────────────────────

/**
 * validateEntitlement asks the backend whether the currently-authenticated
 * user (via session cookie) may access the content identified by `storageId`.
 * The Go backend is the single source of truth — it checks:
 *   • Active Better-Auth session
 *   • EXPIRED subscription tier from the users table
 *   • DRM token approved for this specific VOD
 *   • Any per-file unlock purchase record
 */
async function fetchEntitlement(
  storageId: string,
  reason: string,
): Promise<SubscriptionCheckResult> {
  try {
    // ── Preferred single-endpoint check ───────────────────────────────────────
    const res: any = await api.get(`/storage/${storageId}/entitlement`, {
      params: { reason },
    });
    return {
      entitled: res.entitled ?? res.data?.entitled ?? false,
      tier: (res.tier || res.data?.tier || "free") as SubscriptionTier,
      quotaRemaining: res.quota_remaining ?? res.data?.quota_remaining ?? 0,
      quotaTotal: res.quota_total ?? res.data?.quota_total ?? 0,
      expiresAt: res.expires_at ?? res.data?.expires_at ?? null,
      reason: res.reason ?? res.data?.reason,
    };
  } catch {
    // ── Fallback: derive from subscription store + VOD store ─────────────────
    // This keeps the UX responsive when the entitlement endpoint is
    // not yet deployed on the backend.
    try {
      const subRes: any = await api.get("/subscription/me");
      const vodRes: any = await api.get(`/vod/${storageId}`);

      const tier = (subRes.tier || "free") as SubscriptionTier;
      const isPremium = vodRes.is_premium ?? vodRes.data?.is_premium ?? false;
      const isUnlocked = vodRes.unlocked ?? vodRes.data?.unlocked ?? false;

      // Free tier may watch non-premium; VIP tiers may watch everything up
      // to their monthly quota.
      const entitled =
        !isPremium ||
        tier !== "free" ||
        isUnlocked;

      return {
        entitled,
        tier,
        quotaRemaining: subRes.quota_remaining ?? 0,
        quotaTotal: subRes.quota_total ?? 0,
        expiresAt: subRes.expires_at ?? null,
        reason: entitled
          ? undefined
          : isPremium && tier === "free"
          ? "Konten ini tersedia untuk pengguna VIP saja."
          : "Kuota bulanan habis.",
      };
    } catch {
      return {
        entitled: false,
        tier: "free",
        quotaRemaining: 0,
        quotaTotal: 0,
        expiresAt: null,
        reason:
          "Tidak dapat memverifikasi langganan. Periksa koneksi dan coba lagi.",
      };
    }
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────────

interface UseSubscriptionCheckReturn {
  result: SubscriptionCheckResult | null;
  checking: boolean;
  error: string | null;
  check: (storageId: string, reason?: string) => Promise<SubscriptionCheckResult>;
  clear: () => void;
}

export function useSubscriptionCheck(
  opts: UseSubscriptionCheckOptions = {},
): UseSubscriptionCheckReturn {
  const { autoCheck = true, onEntitled, onDenied } = opts;

  const [result, setResult]   = useState<SubscriptionCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const callIdRef = useRef(0);

  const runCheck = useCallback(
    async (storageId: string, reason = "stream_access"): Promise<SubscriptionCheckResult> => {
      const callId = ++callIdRef.current;
      setChecking(true);
      setError(null);

      try {
        const r = await fetchEntitlement(storageId, reason);

        // Ignore stale responses from earlier calls
        if (callId !== callIdRef.current) return r;

        setResult(r);

        if (r.entitled) {
          onEntitled?.(r);
        } else {
          onDenied?.(r);
        }

        return r;
      } catch (e: any) {
        if (callId !== callIdRef.current) {
          return { entitled: false, tier: "free", quotaRemaining: 0, quotaTotal: 0, expiresAt: null };
        }
        const msg = e?.message || "Gagal memeriksa status langganan";
        setError(msg);
        toast.error(msg);
        return { entitled: false, tier: "free", quotaRemaining: 0, quotaTotal: 0, expiresAt: null, reason: msg };
      } finally {
        if (callId === callIdRef.current) setChecking(false);
      }
    },
    [onEntitled, onDenied],
  );

  const clear = useCallback(() => {
    callIdRef.current++;
    setResult(null);
    setChecking(false);
    setError(null);
  }, []);

  return { result, checking, error, check: runCheck, clear };
}
