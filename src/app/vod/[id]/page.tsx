"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useVOD } from "@/hooks/useVOD";
import { useSession } from "@/lib/auth-client";
import { useUserStore } from "@/store/useUserStore";
import { HLSPlayer } from "@/components/HLSPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  Crown,
  Play,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  Clock,
  Loader2,
  AlertCircle
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
    drmToken,
    verifyingDRM,
    loading,
    error,
    requestDRMToken,
    unlockVOD,
    isUnlocked
  } = useVOD(vodId);

  const { wallet, fetchWallet } = useUserStore();
  const [purchasing, setPurchasing] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleUnlock = async () => {
    if (!session) {
      toast.error("Silakan masuk terlebih dahulu untuk membeli rekaman premium");
      return;
    }
    if (!currentVOD) return;

    if (wallet && wallet.balance < currentVOD.priceIDR) {
      toast.error("Saldo Wallet Anda tidak mencukupi. Silakan lakukan isi ulang (top-up) terlebih dahulu.");
      return;
    }

    setPurchasing(true);
    try {
      await unlockVOD(vodId, currentVOD.priceIDR);
      toast.success("VOD Premium berhasil dibeli! 🎉");
      fetchWallet();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuka VOD premium");
    } finally {
      setPurchasing(false);
    }
  };

  const handleStartPlay = async () => {
    if (!currentVOD) return;

    // Jika premium dan belum dibeli
    if (currentVOD.isPremium && !isUnlocked(vodId)) {
      toast.error("Anda harus membeli hak akses video premium ini terlebih dahulu");
      return;
    }

    // Minta token DRM terlebih dahulu
    const token = await requestDRMToken(vodId);
    if (token) {
      toast.success("Dekripsi lisensi DRM berhasil diverifikasi! 🛡️");
      setPlaying(true);
    } else {
      toast.error("Gagal mendapatkan lisensi pemutaran DRM.");
    }
  };

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
        <p className="text-neutral-400 max-w-sm">
          {error || "Video mungkin telah dihapus oleh host atau link tidak valid."}
        </p>
        <Link href="/vod">
          <Button className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-full font-bold">
            <ChevronLeft className="h-4 w-4 mr-2" /> Kembali ke Katalog VOD
          </Button>
        </Link>
      </div>
    );
  }

  const unlocked = isUnlocked(vodId);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      
      {/* HEADER */}
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

      {/* CONTENT */}
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 py-10 space-y-8">
        
        {/* VIDEO PLAYER ZONE */}
        <div className="relative aspect-video w-full bg-neutral-950 border border-neutral-900 rounded-3xl overflow-hidden shadow-2xl">
          
          {verifyingDRM ? (
            /* DRM VERIFYING OVERLAY */
            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center gap-4 text-center p-6 z-30">
              <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-purple-400 block tracking-widest animate-pulse">Memverifikasi Lisensi DRM</span>
                <span className="text-[10px] text-neutral-500 block leading-relaxed max-w-xs">
                  Menghubungkan ke server lisensi aman (KMS) dan mengonfigurasi modul dekripsi perangkat keras...
                </span>
              </div>
            </div>
          ) : !playing ? (
            /* PREPLAY SCREEN OVERLAY */
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-6 p-6 z-20 text-center">
              <img 
                src={currentVOD.thumbnailUrl} 
                alt={currentVOD.title}
                className="absolute inset-0 w-full h-full object-cover -z-10 opacity-40 blur-[2px]"
              />
              <div className="absolute inset-0 bg-black/60 -z-10" />

              {currentVOD.isPremium && !unlocked ? (
                // Locked Premium
                <div className="space-y-4 max-w-sm">
                  <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500 shadow-lg">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-md font-black">Video Premium Terkunci</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Anda harus membeli rekaman siaran langsung eksklusif ini terlebih dahulu senilai <span className="font-extrabold text-amber-400">Rp {currentVOD.priceIDR.toLocaleString()}</span>.
                    </p>
                  </div>

                  <Button
                    onClick={handleUnlock}
                    disabled={purchasing}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold py-5 text-xs transition"
                  >
                    {purchasing ? <Loader2 className="h-4 w-4 animate-spin text-white mr-2" /> : <Crown className="h-4 w-4 mr-2" />}
                    Beli Akses Video Premium
                  </Button>
                </div>
              ) : (
                // Unlocked or Free
                <div className="space-y-4 max-w-sm">
                  <div className="w-14 h-14 bg-purple-600/10 border border-purple-500/20 rounded-full flex items-center justify-center mx-auto text-purple-400 shadow-lg cursor-pointer hover:scale-105 transition" onClick={handleStartPlay}>
                    <Play className="h-6 w-6 fill-purple-400 ml-1" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-md font-black">Siap Diputar</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Video ini dilindungi oleh manajemen hak digital (DRM). Klik putar untuk memulai validasi enkripsi lisensi.
                    </p>
                  </div>

                  <Button
                    onClick={handleStartPlay}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold py-5 text-xs transition"
                  >
                    Putar Video Aman (DRM)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* SECURE HLS PLAYER */
            <HLSPlayer 
              src={currentVOD.videoUrl} 
              poster={currentVOD.thumbnailUrl} 
            />
          )}
        </div>

        {/* METADATA INFO */}
        <div className="bg-neutral-950 p-8 rounded-3xl border border-neutral-900 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {currentVOD.isPremium ? (
                  <span className="bg-amber-950 text-amber-400 border border-amber-900/50 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                    <Crown className="h-3.5 w-3.5 fill-amber-400" /> Premium
                  </span>
                ) : (
                  <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">
                    Gratis
                  </span>
                )}
                
                <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-purple-400" />
                  {Math.floor(currentVOD.duration / 60)} Menit
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight leading-tight">{currentVOD.title}</h1>
            </div>

            <div className="bg-neutral-900/60 border border-neutral-800/80 px-4 py-2 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs uppercase">
                {currentVOD.host?.username.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-200">{currentVOD.host?.username}</span>
                <span className="text-[9px] text-neutral-500">Official Creator</span>
              </div>
            </div>
          </div>

          <hr className="border-neutral-900" />

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Deskripsi Video</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{currentVOD.description}</p>
          </div>
        </div>

      </main>
    </div>
  );
}
