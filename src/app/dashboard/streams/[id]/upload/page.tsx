// src/app/dashboard/streams/[id]/upload/page.tsx
// Host upload page — endpoint of the stream lifecycle.
// Security posture (Task F):
//   • All files go through POST /storage/* — no direct S3/Amazon calls.
//   • DecentralizedUploadSecure fires the backend entitlement check before any
//     chunk is PUT to a presigned URL.
//   • For premium-flagged recordings, a valid DRM token or active VIP
//     subscription must be confirmed server-side before the upload can start.
//   • Presigned URLs returned here are always signed by the Go backend — the
//     frontend never signs or constructs any URL itself.

"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { DecentralizedUploadSecure } from "@/components/upload/DecentralizedUploadSecure";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, HardDrive, UploadCloud, ShieldCheck, Lock, Sparkles } from "lucide-react";
import type { StorageFile } from "@/lib/types/storage";
import { toast } from "sonner";

function UploadPageContent() {
  const params = useParams();
  const streamId = params.id as string;

  const handleUploadComplete = (file: StorageFile) => {
    toast.success(
      `"${file.filename}" berhasil diunggah & direplikasi ke ${file.primary_provider.toUpperCase()}!`,
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-purple-600 selection:text-white py-8 px-4 lg:px-8">
      <div className="max-w-3xl mx-auto w-full space-y-6">

        {/* ── PAGE HEADER ──────────────────────────────────────────────────────── */}
        <div className="text-center space-y-2 p-7 bg-gradient-to-r from-indigo-500/8 via-purple-500/5 to-black border border-indigo-500/15 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2.5 text-[9px] font-black bg-indigo-500/15 text-indigo-400 rounded-bl-2xl tracking-wider">
            STUDIO UPLOAD
          </div>
          <div className="flex items-center justify-center gap-2">
            <HardDrive className="h-6 w-6 text-indigo-400" />
            <h1 className="text-xl font-black text-indigo-400 tracking-tight">
              Unggah Rekaman Siaran
            </h1>
          </div>
          <p className="text-[11px] text-neutral-400 max-w-lg mx-auto font-semibold leading-relaxed">
            Unggah rekaman VOD siaran langsung Anda ke penyimpanan terdesentralisasi (OCI, Storj, Filebase).
            Semua file melewati validasi backend — tidak ada unggahan langsung ke S3.
          </p>

          {/* Security inline badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
              <ShieldCheck className="h-3 w-3" /> Backend Validated
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/15">
              <Lock className="h-3 w-3" /> Presigned URL Server-Side
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/15">
              <Sparkles className="h-3 w-3" /> Multi-Provider Replikasi
            </span>
          </div>
        </div>

        {/* ── STREAM INFO BAR ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl">
          <div className="size-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-[10px]">
            {streamId.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Stream ID</p>
            <p className="text-xs font-mono text-neutral-300 truncate">{streamId}</p>
          </div>
          <UploadCloud className="h-4 w-4 text-neutral-600" />
        </div>

        {/* ── SECURE UPLOADER ─────────────────────────────────────────────────── */}
        <DecentralizedUploadSecure
          entitlementReason="vod_publish"
          enforceGate={true}
          onUploadComplete={(info) => handleUploadComplete(info as unknown as StorageFile)}
        />

      </div>
    </div>
  );
}

export default function HostUploadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
      }
    >
      <UploadPageContent />
    </Suspense>
  );
}
