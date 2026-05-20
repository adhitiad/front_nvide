// src/app/vod/[id]/page.tsx
// VOD detail page — fully security-gated (Task F).
//
// F-1  All streaming accesses go exclusively through the backend.
//        No client-side fetch to S3 / storage buckets is ever made here.
// F-2  Presigned URLs are generated server-side.  SubscriptionGate fires the
//        entitlement check before any URL is exposed to child components.
// F-3  HLSPlayer only receives a presigned URL that has already passed
//        SubscriptionGate.  No raw URL from the store is passed to the player.
// F-4  The replication status panel shows server-validated provider records
//        from SubscriptionGate — no direct API calls from this component.

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useVOD } from "@/hooks/useVOD";
import { useSession } from "@/lib/auth-client";
import { useUserStore } from "@/store/useUserStore";
import { HLSPlayer } from "@/components/HLSPlayer";
import { SubscriptionGate, type SubscriptionGateResult } from "@/components/upload/SubscriptionGate";
import { Button } from "@/components/ui/button";
import type { ProviderReplication } from "@/lib/types/storage";
import {
  ChevronLeft,
  Crown,
  Play,
  Lock,
  RefreshCw,
  ShieldCheck,
  Eye,
  Clock,
  Loader2,
  AlertCircle,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VODDetailPage({ params }: PageProps) {
  const { id: vodId } = use(params);
  const { data: session } = useSession();

  const {
    currentVOD,
    drmToken, verifyingDRM,
    loading, error,
    requestDRMToken, unlockVOD, isUnlocked,
  } = useVOD(vodId);

  const { wallet, fetchWallet } = useUserStore();
  const [purchasing, setPurchasing] = useState(false);
  const [playing,     setPlaying]     = useState(false);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  const handleUnlock = async () => {
    if (!session) {
      toast.error("Silakan masuk terlebih dahulu untuk membeli rekaman premium");
      return;
    }
    if (!currentVOD) return;
    if (wallet && wallet.balance < currentVOD.priceIDR) {
      toast.error("Saldo Wallet Anda tidak mencukupi. Top-up terlebih dahulu.");
      return;
    }
    setPurchasing(true);
    try {
      await unlockVOD(vodId, currentVOD.priceIDR);
      toast.success("VOD Premium berhasil dibeli! 🎉");
      fetchWallet();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuka VOD premium");
    } finally { setPurchasing(false); }
  };

  const handleStartPlay = async () => {
    if (!currentVOD) return;
    if (currentVOD.isPremium && !isUnlocked(vodId)) {
      toast.error("Anda harus membeli hak akses video premium ini terlebih dahulu");
      return;
    }
    const token = await requestDRMToken(vodId);
    if (token) {
      toast.success("Dekripsi lisensi DRM berhasil diverifikasi! 🛡️");
      setPlaying(true);
    } else {
      toast.error("Gagal mendapatkan lisensi pemutaran DRM.");
    }
  };

  // ── Loading / Error states (before gate) ────────────────────────────────────
  if (loading && !currentVOD) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        <span className="text-md font-bold text-neutral-400">Memuat berkas video...</span>
      </div>
    );
  }

  if (error || !currentVOD) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-white p-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-2" />
        <h2 className="text-2xl font-black text-red-400">Video Tidak Ditemukan</h2>
        <p className="text-neutral-400 max-w-sm">{error || "Video mungkin dihapus atau link tidak valid."}</p>
        <Link href="/vod">
          <Button className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-full font-bold">
            <ChevronLeft className="h-4 w-4 mr-2" /> Kembali ke Katalog VOD
          </Button>
        </Link>
      </div>
    );
  }

  const unlocked = isUnlocked(vodId);

  // ── Render-prop component for the game-content zone ──────────────────────────
  function renderGateContent(result: SubscriptionGateResult) {
    const { streamUrl, ipfsHash, providers, tier, entitled } = result;

    // ── Sub-component: player zone ────────────────────────────────────────────
    const PlayerZone = () => {
      if (!currentVOD) return null;

      if (verifyingDRM) {
        return (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center gap-4 text-center p-6 z-30">
            <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-purple-400 block tracking-widest animate-pulse">Memverifikasi Lisensi DRM</span>
              <span className="text-[10px] text-neutral-500 block leading-relaxed max-w-xs">
                Menghubungkan ke server lisensi aman (KMS) dan mengonfigurasi modul dekripsi perangkat keras...
              </span>
            </div>
          </div>
        );
      }

      if (playing && streamUrl) {
        return (
          <HLSPlayer src={streamUrl} poster={currentVOD.thumbnailUrl} />
        );
      }

      /* Preplay / purchase card */
      const isLockedPremium = currentVOD.isPremium && !unlocked;
      if (isLockedPremium) {
        return (
          <div className="space-y-4 max-w-sm">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500 shadow-lg">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-md font-black">Video Premium Terkunci</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Anda harus membeli rekaman siaran eksklusif ini terlebih dahulu senilai{" "}
                <span className="font-extrabold text-amber-400">Rp {currentVOD.priceIDR.toLocaleString()}</span>.
              </p>
            </div>
            <Button onClick={handleUnlock} disabled={purchasing}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold py-5 text-xs transition">
              {purchasing ? <Loader2 className="h-4 w-4 animate-spin text-white mr-2" /> : <Crown className="h-4 w-4 mr-2" />}
              Beli Akses Video Premium
            </Button>
          </div>
        );
      }

      /* Free or purchased — click to trigger DRM gate */
      return (
        <div className="space-y-4 max-w-sm">
          <div className="w-14 h-14 bg-purple-600/10 border border-purple-500/20 rounded-full flex items-center justify-center mx-auto text-purple-400 shadow-lg cursor-pointer hover:scale-105 transition"
            onClick={handleStartPlay}>
            <Play className="h-6 w-6 fill-purple-400 ml-1" />
          </div>
          <div className="space-y-1">
            <h3 className="text-md font-black">Siap Diputar</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Backend memvalidasi langganan Anda sebelum menghasilkan presigned URL.
              Klik putar untuk memulai validasi DRM.
            </p>
          </div>
          <Button
            onClick={handleStartPlay}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold py-5 text-xs transition"
          >
            Putar Video Aman (DRM)
          </Button>
        </div>
      );
    };

    // ── Sub-component: replication status ─────────────────────────────────────
    function ReplicationStatus() {
      const [retrying, setRetrying] = useState(false);
      const { refresh } = result;

      const tierLabel = (t: string) => {
        switch (t) {
          case "free": return "Free"; case "vip1": return "VIP 1";
          case "vip2": return "VIP 2"; case "vip3": return "VIP 3";
          case "expired": return "❌ Expired"; default: return t.toUpperCase();
        }
      };
      const tierColor = (t: string) => {
        switch (t) {
          case "vip1": return "text-sky-400 bg-sky-500/10 border-sky-500/20";
          case "vip2": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
          case "vip3": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
          default: return "text-neutral-400 bg-neutral-500/10 border-neutral-500/20";
        }
      };

      const allReady  = providers.length > 0 && providers.every((p: any) => p.status === "ready");
      const hasFailed = providers.some((p:    any) => p.status === "failed");


      const meta: Record<string,{label:string;bg:string;border:string;text:string}> = {
        oci:      { label:"OCI",      bg:"bg-orange-500/8",   border:"border-orange-400/25",    text:"text-orange-500" },
        storj:    { label:"Storj",    bg:"bg-yellow-500/8",   border:"border-yellow-400/25",    text:"text-yellow-500" },
        filebase: { label:"Filebase", bg:"bg-sky-500/8",      border:"border-sky-400/25",      text:"text-sky-500"    },
      };

      return (
        <div className="w-full space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-bold text-neutral-300">Status Replikasi &amp; Penyimpanan</span>
            </div>
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 ${tierColor(tier)}`}>
              <ShieldCheck className="h-3 w-3" /> {tierLabel(tier)} — Terverifikasi
            </span>
          </div>

          {/* Provider cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(["oci","storj","filebase"] as const).map((pKey) => {
              const prov = providers.find((p: any) => p.provider === pKey) ??
                ({ provider:"oci" as const, status:"pending" as const, url:null, replicated_at:null, error:null } satisfies ProviderReplication);
              const isReady  = prov.status === "ready";
              const isFailed = prov.status === "failed";
              const m = meta[prov.provider];
              const border = isReady ? "border-emerald-500/25" : isFailed ? "border-red-500/25" : "border-amber-500/20";
              const bg     = isReady ? "bg-emerald-500/[0.03]" : isFailed ? "bg-red-500/[0.03]" : "bg-amber-500/[0.02]";
              return (
                <div key={pKey} className={`p-3.5 rounded-2xl border ${border} ${bg} flex flex-col gap-1.5`}>
                  <span className={`size-6 rounded-lg flex items-center justify-center text-[9px] font-black border ${m.bg} ${m.border} ${m.text}`}>
                    {m.label.slice(0,2).toUpperCase()}
                  </span>
                  {isReady ? (
                    <span className="text-[9px] font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Tersimpan
                    </span>
                  ) : isFailed ? (
                    <span className="text-[9px] font-semibold text-red-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Gagal
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold text-amber-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Mereplikasi…
                    </span>
                  )}
                  {prov.provider === "filebase" && ipfsHash && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-[9px] text-sky-400 font-mono truncate block flex-1">{ipfsHash}</code>
                      <span className="text-[9px] text-muted-foreground shrink-0">IPFS ✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary / Retry */}
          <div className="flex items-center justify-between pt-1">
            {allReady ? (
              <span className="text-[10px] font-bold text-emerald-500">✓ Sesuai di semua provider</span>
            ) : hasFailed ? (
              <span className="text-[10px] font-bold text-red-500">⚠ Ada yang gagal — periksa status masing-masing provider</span>
            ) : (
              <span className="text-[10px] font-bold text-amber-500">⏳ Sedang mereplikasi ke penyimpanan terdesentralisasi…</span>
            )}
            {hasFailed && (
              <Button size="sm" variant="ghost" className="text-[10px] h-7 text-neutral-400" disabled={retrying}>
                <RefreshCw className={`h-3 w-3 mr-1 ${retrying ? "animate-spin" : ""}`} />
                Retry Replikasi
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (!entitled) {
      // ── Entitlement denied — lock the player UI ──────────────────────────────
      return (
        <div className="space-y-6">
          <div className="relative aspect-video w-full bg-neutral-950 border border-red-500/15 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-4 text-center p-6">
              <Lock className="h-12 w-12 text-red-500/70" />
              <div className="space-y-1">
                <span className="text-sm font-black text-red-400 uppercase tracking-widest">Konten Terkunci</span>
                <p className="text-[10px] text-neutral-500 max-w-xs leading-relaxed">
                  Langganan Anda belum memenuhi syarat untuk video ini. Hubungi dukungan untuk detail lebih lanjut.
                </p>
              </div>
              <Button onClick={result.refresh} size="sm" variant="outline" className="text-red-400 border-red-500/20">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Coba Lagi
              </Button>
            </div>
          </div>

          {/* Replication status is hidden when not entitled — no provider data leaks */}
          <div className="p-4 bg-amber-500/8 border border-amber-500/15 rounded-2xl">
            <p className="text-[10px] font-bold text-amber-400 text-center">
              Status replikasi tidak ditampilkan hingga verifikasi langganan berhasil.
            </p>
          </div>
        </div>
      );
    }

    // ── Entitled — render player + replication status ──────────────────────────
    return (
      <div className="space-y-6">
        <div className="relative aspect-video w-full bg-neutral-950 border border-neutral-900 rounded-3xl overflow-hidden shadow-2xl">
          <PlayerZone />
        </div>

        {/* Replication status — comes from SubscriptionGate result; no direct API */}
        <ReplicationStatus />
      </div>
    );
  }

  // ── Page layout (wraps all content, including the gated zone) ────────────────
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vod">
            <Button size="icon" variant="ghost" className="text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
          <span className="text-sm font-bold text-neutral-300">NVide DRM Player</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
          Enkripsi Widevine DRM Aktif
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 py-10 space-y-8">
        {/* The entire content zone is inside SubscriptionGate render prop */}
        <SubscriptionGate storageId={vodId}>
          {renderGateContent}
        </SubscriptionGate>
      </main>
    </div>
  );
}
