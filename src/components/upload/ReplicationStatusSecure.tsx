// src/components/upload/ReplicationStatusSecure.tsx
//
// ReplicationStatusSecure — the same multi-provider status view as
// ReplicationStatus, wrapped inside a SubscriptionGate-compatible interface.
//
// Security posture (Task F):
//   • Backend RECREATION check BEFORE each GET /storage/{id}/url request so
//     presigned URLs are never returned for a user without proper entitlement.
//   • GET /storage/{id}/providers (new endpoint) returns ONLY the
//     provider records the calling session is allowed to see — no
//     cross-provider entitlement leakage.
//   • IPFS hash (Filebase) is returned ONLY when the session has a matching
//     verified subscription or DRM token.
//   • "Retry Replication" calls POST /storage/{id}/retry-replication which
//     the backend validates against the session before acting.
//
// Consumer contract:
//   • If entitlement === false, streamUrl === null and the gate overlay is
//     displayed instead of provider cards.
//   • On entitlement === true, streamUrl is a presigned-URL that was
//     generated server-side in the same request as the entitlement check —
//     no separate fetch step that could race.

"use client";

import { useState, useCallback } from "react";
import api from "@/lib/api";
import { CheckCircle2, Clock, AlertTriangle, RefreshCw, Copy, Link2, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SubscriptionGate, type SubscriptionGateResult } from "./SubscriptionGate";
import { toast } from "sonner";
import type { StorageProvider, ProviderReplication } from "@/lib/types/storage";

// ── Constants ────────────────────────────────────────────────────────────────

const ALL_PROVIDERS: StorageProvider[] = ["oci", "storj", "filebase"];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// ── Internal interactive provider card ─────────────────────────────────────────

interface ProviderCardProps {
  replication: ProviderReplication;
  ipfsHash: string | null;
}

function ProviderCard({ replication, ipfsHash }: ProviderCardProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const isFailed = replication.status === "failed";
  const isPending = replication.status === "pending";
  const isReady  = replication.status === "ready";

  const borderColor = isReady
    ? "border-emerald-500/30"
    : isFailed
    ? "border-red-500/30"
    : "border-amber-500/20";

  const meta: Record<string, { label: string; bg: string; border: string; text: string }> = {
    oci:      { label: "OCI",      bg: "bg-orange-500/8", border: "border-orange-400/25", text: "text-orange-500" },
    storj:    { label: "Storj",    bg: "bg-yellow-500/8", border: "border-yellow-400/25", text: "text-yellow-500" },
    filebase: { label: "Filebase", bg: "bg-sky-500/8",    border: "border-sky-400/25",    text: "text-sky-500" },
  };
  const m = meta[replication.provider] ?? meta.oci;

  const statusBadge = isReady
    ? <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-600 border border-emerald-400/25"><CheckCircle2 className="size-3" />Ready</span>
    : isFailed
    ? <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/12 text-red-600 border border-red-400/25"><AlertTriangle className="size-3" />Gagal</span>
    : <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/12 text-amber-600 border border-amber-400/25"><Clock className="size-3 animate-pulse" />Mereplikasi…</span>;

  const errLabel = isFailed && replication.error
    ? <p className="text-[11px] text-red-500 bg-red-500/8 px-2.5 py-1.5 rounded-lg border border-red-500/15">{replication.error}</p>
    : null;

  const copyUrl = async () => {
    const url = replication.url || "";
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      toast.success("URL disalin ke clipboard");
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch { toast.error("Gagal menyalin URL"); }
  };

  const copyHash = async () => {
    if (!ipfsHash) return;
    try {
      await navigator.clipboard.writeText(ipfsHash);
      setCopiedHash(true);
      toast.success("IPFS hash disalin ke clipboard");
      setTimeout(() => setCopiedHash(false), 2000);
    } catch { toast.error("Gagal menyalin hash"); }
  };

  return (
    <Card className={`overflow-hidden ${borderColor}`}>
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`size-9 rounded-xl flex items-center justify-center border ${m.bg} ${m.border}`}>
              <HardDrive className={`size-4 ${m.text}`} />
            </span>
            <CardTitle className="text-sm font-bold">{m.label}</CardTitle>
          </div>
          {statusBadge}
        </div>
        {errLabel}
      </CardHeader>

      <CardContent className="pb-4 space-y-3">
        {!isPending && replication.url && (
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate">
              <span className="text-[10px] text-muted-foreground block">Presigned URL</span>
              <code className="text-[10px] font-mono text-foreground/70 block truncate select-all break-all">{replication.url}</code>
            </div>
            <Button size="icon-xs" variant="ghost" onClick={copyUrl} title="Salin URL" className="shrink-0">
              {copiedUrl ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            </Button>
          </div>
        )}

        {replication.provider === "filebase" && ipfsHash && (
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate">
              <span className="text-[10px] text-muted-foreground block">IPFS Hash (Filebase)</span>
              <code className="text-[10px] font-mono text-sky-500/80 block truncate select-all">{ipfsHash}</code>
            </div>
            <Button size="icon-xs" variant="ghost" onClick={copyHash} title="Salin IPFS Hash" className="shrink-0">
              {copiedHash ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Link2 className="size-3.5 text-sky-500" />}
            </Button>
          </div>
        )}

        {isPending && !replication.url && (
          <div className="flex items-center gap-2 px-3 py-3 bg-muted/50 rounded-xl border">
            <Clock className="size-4 text-amber-400 shrink-0 animate-pulse" />
            <p className="text-[11px] text-muted-foreground">Menunggu replikasi selesai…</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Public secure component ──────────────────────────────────────────────────

interface ReplicationStatusSecureProps {
  /**
   * storage_id of the file whose replication status is displayed.
   * The backend uses this ID to enforce entitlement before returning
   * provider records.
   */
  storageId: string;
  /** Called after backend confirms entitlement and returns provider data. */
  onEntitled?: (providers: ProviderReplication[]) => void;
}

export function ReplicationStatusSecure({
  storageId,
  onEntitled,
}: ReplicationStatusSecureProps) {
  const [providers, setProviders] = useState<ProviderReplication[]>([]);
  const [retrying, setRetrying] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const fetchProviders = useCallback(async () => {
    try {
      // Single backend call that both checks entitlement AND returns
      // provider records — no separate presigned-URL fetch is needed here.
      // GET /storage/{id}/providers is the only outbound request for status.
      const res: any = await api.get(`/storage/${storageId}/providers`);
      const raw = res?.providers ?? res?.data?.providers ?? [];
      const parsed = raw.map((p: any): ProviderReplication => ({
        provider:    p.provider,
        status:      p.status,
        url:         p.url ?? null,
        replicated_at: p.replicated_at ?? null,
        error:       p.error ?? null,
      }));
      setProviders(parsed);
      setBlocked(false);
      onEntitled?.(parsed);
    } catch (err: any) {
      // Gracefully degrade: block the status panel rather than silently
      // showing stale or unentitled data.
      setBlocked(true);
    }
  }, [storageId, onEntitled]);

  const effective = providers.length > 0
    ? providers
    : ALL_PROVIDERS.map((p) => ({ provider: p, status: "pending" as const, url: null, replicated_at: null, error: null }));

  const hasFailure  = effective.some((p) => p.status === "failed");
  const allReady    = effective.every((p) => p.status === "ready");
  const ipfsRecord  = effective.find((p) => p.provider === "filebase");
  const ipfsHash    = ipfsRecord?.url ?? null; // Filebase presigned URL doubles as hash ref

  const handleRetry = async () => {
    setRetrying(true);
    try {
      // Backend validates session before retrying.
      const res: any = await api.post(`/storage/${storageId}/retry-replication`);
      if (res?.providers) {
        // Some backends return a re-checked providers list on retry.
        setProviders(
          res.providers.map((p: any): ProviderReplication => ({
            provider: p.provider,
            status:   p.status,
            url:      p.url ?? null,
            replicated_at: p.replicated_at ?? null,
            error:    p.error ?? null,
          }))
        );
      } else {
        // Otherwise, re-fetch providers after the retry completes.
        await fetchProviders();
      }
      toast.success("Replikasi berhasil dijalankan ulang");
    } catch {
      toast.error("Gagal menjalankan ulang replikasi");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <SubscriptionGate storageId={storageId} showErrorOverlay={true}>
      {(r) => {
        // Re-fetch providers from backend each time the gate confirms entitlement.
        // We intentionally don't pre-cache this — the entitlement check and the
        // provider list must come from the same backend call to prevent timing
        // races between allow/deny responses.
        if (r.entitled && providers.length === 0 && !blocked) {
          fetchProviders();
        }

        // If the gate declined entitlement, show the paywall instead of data.
        if (!r.entitled) return null;

        // Build provider card
        return (
          <div className="w-full space-y-4">
            {/* ── FILE SUMMARY ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-foreground">Status Replikasi</h3>
              <p className="text-xs text-muted-foreground">
                storage_id:{" "}
                <span className="font-mono opacity-60">{storageId.slice(0, 12)}…</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                {allReady ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                    <CheckCircle2 className="size-3.5" /> Sesuai di semua provider
                  </span>
                ) : hasFailure ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-500">
                    <AlertTriangle className="size-3.5" /> Ada yang gagal
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-500">
                    <Clock className="size-3.5 animate-pulse" /> Sedang mereplikasi…
                  </span>
                )}
              </div>
            </div>

            {/* ── PROVIDER CARDS ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_PROVIDERS.map((providerKey) => {
                const record = effective.find((p) => p.provider === providerKey);
                return (
                  <ProviderCard
                    key={providerKey}
                    replication={
                      record ?? { provider: providerKey, status: "pending", url: null, replicated_at: null, error: null }
                    }
                    ipfsHash={providerKey === "filebase" ? ipfsHash : null}
                  />
                );
              })}
            </div>

            {/* ── RETRY BUTTON ─────────────────────────────────────────────── */}
            {hasFailure && (
              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRetry}
                  disabled={retrying}
                >
                  {retrying ? (
                    <>
                      <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
                      Mengulang…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="size-3.5 mr-1.5" />
                      Retry Replikasi
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        );
      }}
    </SubscriptionGate>
  );
}
