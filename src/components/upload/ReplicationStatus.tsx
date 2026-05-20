// src/components/upload/ReplicationStatus.tsx
"use client";

import { useState } from "react";
import { useStorageStore } from "@/store/useStorageStore";
import { CheckCircle2, Clock, AlertTriangle, RefreshCw, Copy, Link2, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { StorageFile, ProviderReplication, StorageProvider } from "@/lib/types/storage";

const ALL_PROVIDERS: StorageProvider[] = ["oci", "storj", "filebase"];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

const PROVIDER_META: Record<
  StorageProvider,
  { label: string; bg: string; border: string; text: string }
> = {
  oci: {
    label: "OCI",
    bg: "bg-orange-500/8",
    border: "border-orange-400/25",
    text: "text-orange-500",
  },
  storj: {
    label: "Storj",
    bg: "bg-yellow-500/8",
    border: "border-yellow-400/25",
    text: "text-yellow-500",
  },
  filebase: {
    label: "Filebase",
    bg: "bg-sky-500/8",
    border: "border-sky-400/25",
    text: "text-sky-500",
  },
};

interface ReplicationResult {
  status: "ready" | "pending" | "failed";
  error?: string;
}

interface ReplicationStatusProps {
  file: StorageFile;
  onRetry?: (storageId: string) => void;
}

function StatusBadge({ status, error }: ReplicationResult) {
  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-600 border border-emerald-400/25">
        <CheckCircle2 className="size-3" />
        Ready
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/12 text-red-600 border border-red-400/25">
        <AlertTriangle className="size-3" />
        Gagal
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/12 text-amber-600 border border-amber-400/25">
      <Clock className="size-3 animate-pulse" />
      Sedang Mereplikasi
    </span>
  );
}

function ProviderCard({
  replication,
  ipfsHash,
  storageId,
}: {
  replication: ProviderReplication | undefined;
  ipfsHash: string | null;
  storageId: string;
}) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const meta = replication
    ? PROVIDER_META[replication.provider]
    : PROVIDER_META.filebase;

  const status: ReplicationResult = replication
    ? {
        status: replication.status as ReplicationResult["status"],
        error: replication.error || undefined,
      }
    : { status: "pending" };

  const handleCopyUrl = async () => {
    const url = replication?.url || "";
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      toast.success("URL disalin ke clipboard");
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      toast.error("Gagal menyalin URL");
    }
  };

  const handleCopyHash = async () => {
    if (!ipfsHash) return;
    try {
      await navigator.clipboard.writeText(ipfsHash);
      setCopiedHash(true);
      toast.success("IPFS hash disalin ke clipboard");
      setTimeout(() => setCopiedHash(false), 2000);
    } catch {
      toast.error("Gagal menyalin IPFS hash");
    }
  };

  return (
    <Card
      className={`
        overflow-hidden transition-all
        ${status.status === "ready"
          ? "border-emerald-500/30"
          : status.status === "failed"
          ? "border-red-500/30"
          : "border-amber-500/20"
        }
      `}
    >
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`
                size-9 rounded-xl flex items-center justify-center border
                ${meta.bg} ${meta.border}
              `}
            >
              <HardDrive className={`size-4 ${meta.text}`} />
            </span>
            <CardTitle className="text-sm font-bold">{meta.label}</CardTitle>
          </div>
          <StatusBadge status={status.status} error={status.error} />
        </div>

        {status.error && (
          <p className="text-[11px] text-red-500 bg-red-500/8 px-2.5 py-1.5 rounded-lg border border-red-500/15">
            {status.error}
          </p>
        )}
      </CardHeader>

      <CardContent className="pb-4 space-y-3">
        {status.status !== "pending" && replication?.url && (
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate">
              <span className="text-[10px] text-muted-foreground block">Presigned URL</span>
              <code className="text-[10px] font-mono text-foreground/70 block truncate select-all break-all">
                {replication.url}
              </code>
            </div>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={handleCopyUrl}
              title="Salin URL"
              className="shrink-0"
            >
              {copiedUrl ? (
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
          </div>
        )}

        {ipfsHash && (
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate">
              <span className="text-[10px] text-muted-foreground block">IPFS Hash (Filebase)</span>
              <code className="text-[10px] font-mono text-sky-500/80 block truncate select-all">
                {ipfsHash}
              </code>
            </div>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={handleCopyHash}
              title="Salin IPFS Hash"
              className="shrink-0"
            >
              {copiedHash ? (
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              ) : (
                <Link2 className="size-3.5 text-sky-500" />
              )}
            </Button>
          </div>
        )}

        {status.status === "pending" && !replication?.url && (
          <div className="flex items-center gap-2 px-3 py-3 bg-muted/50 rounded-xl border">
            <Clock className="size-4 text-amber-400 shrink-0 animate-pulse" />
            <p className="text-[11px] text-muted-foreground">
              Menunggu replikasi selesai…
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReplicationStatus({ file, onRetry }: ReplicationStatusProps) {
  const { retryReplication, isUploading } = useStorageStore();
  const [retrying, setRetrying] = useState(false);

  // Build provider map from the file providers array
  const providerMap = new Map<string, ProviderReplication>();
  for (const p of file.providers) {
    providerMap.set(p.provider, p);
  }

  const hasFailure = file.providers.some((p) => p.status === "failed");
  const allReady = file.providers.every((p) => p.status === "ready");

  // If providers array is empty, mark all as pending until backend responds
  const effectiveProviders =
    file.providers.length > 0
      ? file.providers
      : ALL_PROVIDERS.map((p) => ({ provider: p, status: "pending" as const }));

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await retryReplication(file.storage_id);
      toast.success("Replikasi dijalankan ulang");
    } catch {
      toast.error("Gagal menjalankan ulang replikasi");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* ── FILE SUMMARY ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold text-foreground">Status Replikasi</h3>
        <p className="text-xs text-muted-foreground">
          {file.filename}{" "}
          <span className="font-mono opacity-60">
            ({formatBytes(file.file_size)})
          </span>
        </p>

        <div className="flex items-center gap-2 mt-1">
          {allReady ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 className="size-3.5" />
              Sesuai di semua provider
            </span>
          ) : hasFailure ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-500">
              <AlertTriangle className="size-3.5" />
              Ada yang gagal
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-500">
              <Clock className="size-3.5 animate-pulse" />
              Menunggu replikasi selesai
            </span>
          )}
        </div>
      </div>

      {/* ── PROVIDER CARDS ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ALL_PROVIDERS.map((providerKey) => {
          const replication = providerMap.get(providerKey);
          return (
            <ProviderCard
              key={providerKey}
              replication={replication}
              ipfsHash={
                providerKey === "filebase" ? file.ipfs_hash || null : null
              }
              storageId={file.storage_id}
            />
          );
        })}
      </div>

      {/* ── RETRY BUTTON ───────────────────────────────────────────────── */}
      {hasFailure && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={retrying || isUploading}
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
}
