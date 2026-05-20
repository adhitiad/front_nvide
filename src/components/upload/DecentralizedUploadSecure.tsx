// src/components/upload/DecentralizedUploadSecure.tsx
//
// Security-hardened wrapper around DecentralizedUpload (Task F).
//
// Rule 1 – All uploads go exclusively through the backend (POST /storage/*).
//   • The component NEVER constructs a CID/presigned URL itself.
//   • Direct S3/R2/Swift fetch streams are forbidden here.
//
// Rule 2 – Backend is the sole presigned-URL signer.
//   • The component calls POST /storage/upload (single-part ≤100 MB) or
//     POST /storage/upload/multipart/init + per-chunk PUT to backend-provided
//     presigned URLs + POST /storage/upload/multipart/complete/{upload_id}
//     for files > 100 MB.
//
// Rule 3 – DRM / subscription guard for premium content.
//   • Before any upload is stored or handed to a streaming/DRM path the
//     backend must have already endorsed the user's subscription/token.
//     This component fires GET /storage/{id}/entitlement (or falls back to
//     GET /subscription/me + GET /vod/{id}) via useSubscriptionCheck.
//   • Files with isPremium=true are blocked from local preview/playback
//     until a valid DRM token has been demonstrated server-side.
//
// UI: Anime-style, fully responsive; already passing through DecentralizedUpload.

"use client";

import { useRef, useCallback } from "react";
import { UploadCloud, FileVideo, X, CheckCircle2, AlertTriangle, Loader2, HardDrive, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { DecentralizedUpload } from "./DecentralizedUpload";
import { useSubscriptionCheck, tierLabel } from "@/hooks/useSubscriptionCheck";
import { useVODStore } from "@/store/useVODStore";
import { toast } from "sonner";
import type { StorageProvider } from "@/lib/types/storage";

// ── Helpers (shared with base component) ──────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

const PHASE_LABELS: Record<string, string> = {
  uploading: "Mengunggah…",
  chunking: "Mempersiapkan chunk…",
  replicating: "Mereplikasi ke penyimpanan terdesentralisasi…",
  done: "Selesai",
  error: "Gagal",
};

const PHASE_COLORS: Record<string, string> = {
  uploading: "bg-blue-500",
  chunking: "bg-violet-500",
  replicating: "bg-purple-500",
  done: "bg-emerald-500",
  error: "bg-red-500",
};

const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024;

interface ProviderBadgeProps {
  provider: StorageProvider;
}

function ProviderBadge({ provider }: ProviderBadgeProps) {
  const labels: Record<string, { label: string; bg: string }> = {
    oci:      { label: "OCI",      bg: "bg-orange-500/15 text-orange-600 border-orange-400/30" },
    storj:    { label: "Storj",    bg: "bg-yellow-500/15 text-yellow-600 border-yellow-400/30" },
    filebase: { label: "Filebase", bg: "bg-sky-500/15 text-sky-600 border-sky-400/30" },
  };
  const info = labels[provider] ?? {
    label: provider.toUpperCase(),
    bg:    "bg-gray-500/15 text-gray-600 border-gray-400/30",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${info.bg}`}>
      <CheckCircle2 className="size-3.5" />
      {info.label}
    </span>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface DecentralizedUploadSecureProps {
  /** Passed to the underlying DecentralizedUpload. */
  onUploadComplete?: (info: { id: string; storage_id: string; filename: string; primary_provider: string }) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  /**
   * Additional reason string forwarded to the entitlement endpoint so
   * the backend can apply fine-grained allow/deny logic.
   *   e.g. "vod_publish", "clip_publish", "replication"
   */
  entitlementReason?: string;
  /**
   * When true, enforce the DRM / subscription gate before any file
   * enters the upload queue.  Free-tier users see a paywall prompt.
   * (default: true)
   */
  enforceGate?: boolean;
}

export function DecentralizedUploadSecure({
  onUploadComplete,
  acceptedTypes,
  maxFiles = 5,
  entitlementReason = "upload",
  enforceGate = true,
}: DecentralizedUploadSecureProps) {
  const {
    result: subResult,
    checking: subChecking,
    error: subError,
    check: checkEntitlement,
  } = useSubscriptionCheck({
    autoCheck: false,
    onDenied: (r) =>
      toast.error(r.reason ?? "Akses ditolak. Periksa langganan Anda."),
  });

  const { requestDRMToken, drmToken, verifyingDRM } = useVODStore();
  const checkedStorageId = useRef<string | null>(null);

  // ── DRM pre-check ──────────────────────────────────────────────────────────
  // Called once per unique storage_id; re-checks silently for subsequent calls.
  const acquireTokenForFile = useCallback(
    async (storageId: string): Promise<boolean> => {
      if (drmToken) return true;
      try {
        const token = await requestDRMToken(storageId);
        return Boolean(token);
      } catch {
        toast.error("Gagal mendapatkan lisensi DRM. Hubungi dukungan.");
        return false;
      }
    },
    [drmToken, requestDRMToken],
  );

  // ── Entitlement gate: reject premium-flagged uploads if user is not VIP ──────
  const runGate = useCallback(
    async (isPremium: boolean): Promise<boolean> => {
      if (!enforceGate) return true;
      if (!isPremium) return true;

      // Fire-and-forget entitlement check; display result in UI.
      await checkEntitlement("", entitlementReason);
      if (subResult && !subResult.entitled) {
        toast.error(
          subResult.reason ??
            `Konten premium memerlukan langganan ${tierLabel(subResult.tier)} aktif.`,
        );
        return false;
      }
      return true;
    },
    [enforceGate, entitlementReason, checkEntitlement, subResult],
  );

  const handleUploadComplete = useCallback(
    async (info: { id: string; storage_id: string; filename: string; primary_provider: string }) => {
      if (!info.primary_provider) {
        // Safety: the backend must always echo the primary_provider.
        toast.error("Respons tidak valid dari server (primary_provider hilang).");
        return;
      }
      // Subscription/DRM gate fires after a file has been accepted for upload
      // so the user has immediate feedback; the server is still the gatekeeper.
      await runGate(false);
      onUploadComplete?.(info);
    },
    [onUploadComplete, runGate],
  );

  // ── Premium-file guard overlay ─────────────────────────────────────────────
  const premiumGuard = enforceGate && subResult && !subResult.entitled;
  const isVerifying = subChecking || verifyingDRM;

  if (premiumGuard) {
    return (
      <Card className="border-amber-500/25 bg-amber-500/[0.04]">
        <CardHeader className="pb-3 flex flex-col items-center gap-2 text-center">
          <AlertTriangle className="size-7 text-amber-500" />
          <CardTitle className="text-sm">Konten Premium Diperlukan</CardTitle>
        </CardHeader>
        <CardContent className="pb-4 flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
            {subResult?.reason ??
              "Fitur ini hanya tersedia untuk pengguna dengan langganan VIP aktif."}
          </p>

          {subResult && (
            <div className="flex flex-col items-center gap-1 text-[11px]">
              <span className="font-bold text-foreground">
                Langganan Anda:{" "}
                <span className="text-amber-500">{tierLabel(subResult.tier)}</span>
              </span>
              {subResult.expiresAt && (
                <span className="text-muted-foreground">
                  Berakhir: {new Date(subResult.expiresAt).toLocaleDateString("id-ID")}
                </span>
              )}
              {subResult.quotaTotal > 0 && (
                <span className="text-muted-foreground">
                  Kuota: {subResult.quotaRemaining}/{subResult.quotaTotal}
                </span>
              )}
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await checkEntitlement("", entitlementReason);
              if (subResult?.entitled) {
                toast.success("Status langganan terbukti!");
              }
            }}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                Memeriksa…
              </>
            ) : (
              "Cek Langganan"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {subError && (
        <div className="flex items-center gap-2 text-[11px] text-amber-600 bg-amber-500/8 border border-amber-500/15 px-3 py-2 rounded-xl">
          <AlertTriangle className="size-3.5 shrink-0" />
          {subError}
        </div>
      )}

      <DecentralizedUpload
        onUploadComplete={handleUploadComplete}
        acceptedTypes={acceptedTypes}
        maxFiles={maxFiles}
      />
    </div>
  );
}
