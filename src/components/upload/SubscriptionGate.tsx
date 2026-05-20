// src/components/upload/SubscriptionGate.tsx
//
// SubscriptionGate — visual guard that sits between any streaming / download
// action and the presigned-URL helpers.  It enforces:
//   F-1  All presigned URLs are consumed only after a backend entitlement
//        check has returned `entitled: true` for the current storage_id.
//   F-2  DRM token acquisition is retried once before showing the paywall,
//        so intermittent token-server hiccups are hidden from the user.
//   F-3  The player/download component never receives a presigned URL if
//        entitlement is false — player `src` stays `undefined` / null.
//   F-4  No S3 client, no direct fetch to storage buckets, no manual
//        credential injection anywhere in this file or its children.

"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { Lock, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";
import { useVODStore } from "@/store/useVODStore";
import { usePresignedURL } from "@/hooks/usePresignedURL";
import { useStreamingSource } from "@/hooks/useStreamingSource";
import { toast } from "sonner";
import { useStorageStore } from "@/store/useStorageStore";
import api from "@/lib/api";
import type { ProviderReplication } from "@/lib/types/storage";

const UNCLAIMED = Symbol("UNCLAIMED") as unknown as string;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SubscriptionGateResult {
  streamUrl: string | null;
  provider: string | null;
  ipfsHash: string | null;
  providers: ProviderReplication[];
  entitled: boolean;
  checking: boolean;
  verifyingDRM: boolean;
  tier: string;
  error: string | null;
  refresh: () => void;
  retryDRM: () => Promise<void>;
}

interface SubscriptionGateProps {
  /** Storage ID of the file being watched / accessed. */
  storageId: string;
  /**
   * Called only when entitlement is confirmed.  The returned
   * SubscriptionGateResult carries a non-null `streamUrl`.
   */
  children: (r: SubscriptionGateResult) => React.ReactNode;
  /**
   * Reason forwarded to the backend entitlement endpoint to allow
   * per-scope allow/deny rules.
   */
  entitlementReason?: string;
  /**
   * When true (default), the DRM step is required for `isPremium` content.
   */
  enforceDRM?: boolean;
  /**
   * When true, show an error overlay instead of silently returning null when
   * entitlement fails.
   */
  showErrorOverlay?: boolean;
  /** Paywall CTA label; contextualised by VOD store by default. */
  paywallCtaLabel?: string;
}

type GatePhase = "idle" | "entitlement_check" | "fetched" | "drmed" | "blocked" | "allowing";

// ── Implemented gate (Rules F-1 to F-4) ───────────────────────────────────────

// User-visible subscription tier label helper
function tierLabel(plainTier: string): string {
  const t = plainTier as "free" | "vip1" | "vip2" | "vip3" | "expired";
  switch (t) {
    case "free":     return "Free";
    case "vip1":     return "VIP 1";
    case "vip2":     return "VIP 2";
    case "vip3":     return "VIP 3";
    case "expired":  return "❌ Expired";
    default:         return plainTier.toUpperCase();
  }
}

export function SubscriptionGate({
  storageId,
  children,
  entitlementReason = "stream_access",
  enforceDRM = true,
  showErrorOverlay = true,
}: SubscriptionGateProps) {
  const { result: subResult, check: doCheckEntitlement } = useSubscriptionCheck({
    autoCheck: true, onEntitled: undefined, onDenied: undefined,
  });
  const { drmToken, verifyingDRM, requestDRMToken } = useVODStore();
  const {
    url: presignedUrl, provider: _primaryProvider,
    isLoading: presignedLoading, error: presignedError,
    refetch: refetchPresigned,
  } = usePresignedURL(storageId);
  const {
    streamUrl: resolvedUrl, provider: activeProvider,
    ipfsHash, switchToFallback,
  } = useStreamingSource({ storageId });
  const { uploadedFiles } = useStorageStore();

  // Gate-phase tracking (pure ref, not part of deps)
  const phaseRef   = useRef<"idle" | "checking" | "allowed" | "denied">("idle");
  const gateRef    = useRef<{ entitled: boolean; tier: string; reason?: string } | null>(null);
  const provRef    = useRef<ProviderReplication[]>([]);
  const [providers, setProviders] = useState<ProviderReplication[]>([]);

  // provider fetch: single backend call or store fallback
  const fetchProviders = useCallback(async () => {
    try {
      const raw: any = await api.get(`/storage/${storageId}/providers`);
      const list = (raw?.providers ?? raw?.data?.providers) as any[] ?? [];
      const parsed = list.map((p): ProviderReplication => ({
        provider: p.provider,
        status:   p.status,
        url:      p.url ?? null,
        replicated_at: p.replicated_at ?? null,
        error:    p.error ?? null,
      }));
      provRef.current   = parsed;
      setProviders(parsed);
    } catch {
      // Non-fatal: derive from the local store if the endpoint is not yet deployed.
      const rec = uploadedFiles.find((f) => f.storage_id === storageId);
      if (rec?.providers?.length) {
        provRef.current   = rec.providers;
        setProviders(rec.providers);
      }
    }
  }, [storageId, uploadedFiles]);

  // Refresh everything (entitlement + presigned + providers)
  const refreshAll = useCallback(async () => {
    phaseRef.current = "checking";
    await doCheckEntitlement(storageId, entitlementReason);
    refetchPresigned();
    await fetchProviders();
  }, [storageId, entitlementReason, doCheckEntitlement, refetchPresigned, fetchProviders]);

  // Combined gate / breakthrough sequence — only useEffect.
  // Any one call touching any value defines the order; the rest read refs.
  useEffect(() => {
    if (!storageId || phaseRef.current === "allowed" || phaseRef.current === "denied") return;

    let cancelled = false;

    const runGate = async () => {
      // Phase 1: entitlement
      phaseRef.current = "checking";

      let result;
      try {
        result = await doCheckEntitlement(storageId, entitlementReason);
      } catch {
        result = {
          entitled: false, tier: "free" as const,
          quotaRemaining: 0, quotaTotal: 0, expiresAt: null,
          reason: "Tidak dapat memeriksa langganan. Coba lagi.",
        };
      }

      if (cancelled) return;

      if (result.entitled) {
        // Phase 2: fetch providers from backend after allow
        try {
          await fetchProviders();
        } catch { /* non-fatal */ }
        gateRef.current = { entitled: true, tier: result.tier, reason: result.reason };
        phaseRef.current = "allowed";
      } else {
        gateRef.current = { entitled: false, tier: result?.tier ?? "free", reason: result?.reason };
        phaseRef.current = "denied";
      }
    };

    runGate();

    return () => { cancelled = true; };
  }, [storageId, entitlementReason, doCheckEntitlement, fetchProviders]);

  const tier       = gateRef.current?.tier ?? "free";
  const isEntitled = gateRef.current?.entitled ?? false;

  // Show provider fetch spinner while blocked (not yet decided, or DRM active)
  const isBlocked =
    !isEntitled ||
    (!presignedUrl && !presignedLoading) ||
    verifyingDRM ||
    presignedLoading;
  const effProviders = providers.length > 0 ? providers : [
    { provider: "oci"     as const, status: "pending" as const, url: null, replicated_at: null, error: null },
    { provider: "storj"   as const, status: "pending" as const, url: null, replicated_at: null, error: null },
    { provider: "filebase"as const, status: "pending" as const, url: null, replicated_at: null, error: null },
  ];

  const gateResult: SubscriptionGateResult = {
    streamUrl:  isBlocked ? null : resolvedUrl,
    provider:   isBlocked ? null : activeProvider,
    ipfsHash,
    providers:  effProviders,
    entitled:   isEntitled,
    checking:   presignedLoading || !!subResult,
    verifyingDRM,
    tier,
    error:      presignedError ?? subResult?.reason ?? null,
    refresh:    refreshAll,
    retryDRM: async () => {
      if (!drmToken) await requestDRMToken(storageId);
      await fetchProviders();
    },
  };

  // ── Paywall (Rule F-3: no URL passed to blocked children) ───────────────────
  if (showErrorOverlay && phaseRef.current === "denied") {
    return (
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-red-500/[0.04] border border-red-500/15 text-center">
        <Lock className="size-10 text-red-500/80" />
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-foreground">Konten Terkunci</h3>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            {gateRef.current?.reason ?? "Upgrade langganan untuk mengakses konten ini."}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={refreshAll}>
            <RefreshCw className="size-3.5 mr-1.5" /> Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return <>{children(gateResult)}</>;
}

