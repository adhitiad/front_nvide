"use client";

import Link from "next/link";
import { usePrivacy } from "@/hooks/usePrivacy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  Shield,
  EyeOff,
  Clock,
  VolumeX,
  UserX,
  Sparkles,
  Loader2,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

export default function PrivacySettingsPage() {
  const {
    privateProfile,
    incognitoMode,
    disappearingMessagesDuration,
    blockedUsers,
    mutedUsers,
    loading,
    updateSetting,
    unblock,
    unmute
  } = usePrivacy();

  const handleToggle = async (key: "privateProfile" | "incognitoMode", val: boolean) => {
    try {
      await updateSetting(key, val);
      toast.success("Pengaturan privasi diperbarui secara real-time! 🔐");
    } catch {
      toast.error("Gagal memperbarui pengaturan privasi");
    }
  };

  const handleDisappearingChange = async (val: string) => {
    try {
      await updateSetting("disappearingMessagesDuration", val);
      toast.success(`Pesan otomatis menghilang diset ke: ${val === "none" ? "Nonaktif" : val}! ⏳`);
    } catch {
      toast.error("Gagal mengonfigurasi masa habis pesan");
    }
  };

  const handleUnblock = async (userId: string, name: string) => {
    try {
      await unblock(userId);
      toast.success(`Blokir terhadap "${name}" berhasil dibatalkan! 🤝`);
    } catch {
      toast.error("Gagal membatalkan blokir");
    }
  };

  const handleUnmute = async (userId: string, name: string) => {
    try {
      await unmute(userId);
      toast.success(`Bisu (mute) terhadap "${name}" berhasil dibatalkan! 🔊`);
    } catch {
      toast.error("Gagal membatalkan bisu");
    }
  };

  if (loading && blockedUsers.length === 0) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        <span className="text-md font-bold text-neutral-400">Menghubungkan ke pengaturan privasi...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button size="icon" variant="ghost" className="text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="bg-purple-950 text-purple-400 text-xs font-black uppercase px-3 py-1 rounded-md border border-purple-900/50 flex items-center gap-1.5 shadow-lg">
              <Shield className="h-3.5 w-3.5" />
              Privacy settings
            </span>
            <span className="text-sm font-bold text-neutral-300">Konfigurasi Keamanan & Privasi</span>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 w-full max-w-[800px] mx-auto px-6 py-10 space-y-8">
        
        {/* CORE PRIVACY OPTIONS */}
        <div className="space-y-6">
          <h2 className="text-lg font-black flex items-center gap-2">
            <EyeOff className="h-5 w-5 text-purple-400" />
            Keamanan Akun & Jejak Digital
          </h2>

          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-6 shadow-xl">
            
            {/* Private profile */}
            <div className="flex items-center justify-between gap-6 pb-6 border-b border-neutral-900">
              <div className="space-y-1">
                <span className="text-sm font-bold block text-neutral-250">Profil Privat</span>
                <span className="text-xs text-neutral-500 block leading-relaxed max-w-md">
                  Saat diaktifkan, profil Anda tidak akan pernah muncul di hasil pencarian publik dan hanya bisa diakses oleh kreator terverifikasi.
                </span>
              </div>
              <button
                onClick={() => handleToggle("privateProfile", !privateProfile)}
                className={`w-12 h-6 rounded-full p-1 transition duration-300 ${
                  privateProfile ? "bg-purple-600" : "bg-neutral-800"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition duration-300 ${
                  privateProfile ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>

            {/* Incognito mode */}
            <div className="flex items-center justify-between gap-6 pb-6 border-b border-neutral-900">
              <div className="space-y-1">
                <span className="text-sm font-bold block text-neutral-250">Mode Incognito (Penyamaran)</span>
                <span className="text-xs text-neutral-500 block leading-relaxed max-w-md">
                  Saat diaktifkan, sistem tidak akan mencatat riwayat tontonan streaming, komentar, dan transaksi koin Anda di dashboard riwayat tontonan.
                </span>
              </div>
              <button
                onClick={() => handleToggle("incognitoMode", !incognitoMode)}
                className={`w-12 h-6 rounded-full p-1 transition duration-300 ${
                  incognitoMode ? "bg-purple-600" : "bg-neutral-800"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition duration-300 ${
                  incognitoMode ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>

            {/* Disappearing messages */}
            <div className="flex items-center justify-between gap-6 flex-wrap md:flex-nowrap">
              <div className="space-y-1">
                <span className="text-sm font-bold block text-neutral-250 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-purple-400" />
                  Masa Habis Pesan (Disappearing Messages)
                </span>
                <span className="text-xs text-neutral-500 block leading-relaxed max-w-md">
                  Atur waktu penghapusan pesan pribadi otomatis di dalam obrolan chat pribadi (DM) demi keamanan tertinggi.
                </span>
              </div>
              <select
                value={disappearingMessagesDuration}
                onChange={(e) => handleDisappearingChange(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 text-neutral-350 p-3 rounded-xl text-xs font-semibold focus:border-purple-500"
              >
                <option value="none">Jangan Pernah Hapus</option>
                <option value="1h">1 Jam</option>
                <option value="24h">24 Jam</option>
                <option value="7d">7 Hari</option>
              </select>
            </div>

          </div>
        </div>

        {/* BLOCK & MUTE LISTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* BLOCKED USERS */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-neutral-450 tracking-widest flex items-center gap-1.5">
              <UserX className="h-4.5 w-4.5 text-red-500" />
              Daftar Blokir
            </h3>
            
            <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-4 shadow-lg min-h-48">
              {blockedUsers.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-xs text-neutral-600 py-12">
                  Daftar blokir kosong
                </div>
              ) : (
                blockedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-neutral-900/40 border border-neutral-850 p-3 rounded-2xl text-xs">
                    <span className="font-bold text-neutral-300">@{user.username}</span>
                    <Button 
                      onClick={() => handleUnblock(user.id, user.username)}
                      variant="ghost" 
                      className="text-red-400 hover:text-white hover:bg-red-550/10 rounded-xl h-8 text-[10px] font-bold"
                    >
                      Batal Blokir
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MUTED USERS */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-neutral-450 tracking-widest flex items-center gap-1.5">
              <VolumeX className="h-4.5 w-4.5 text-purple-400" />
              Daftar Bisukan (Mute)
            </h3>
            
            <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-4 shadow-lg min-h-48">
              {mutedUsers.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-xs text-neutral-600 py-12">
                  Daftar bisu kosong
                </div>
              ) : (
                mutedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-neutral-900/40 border border-neutral-850 p-3 rounded-2xl text-xs">
                    <span className="font-bold text-neutral-300">@{user.username}</span>
                    <Button 
                      onClick={() => handleUnmute(user.id, user.username)}
                      variant="ghost" 
                      className="text-purple-400 hover:text-white hover:bg-purple-650/10 rounded-xl h-8 text-[10px] font-bold"
                    >
                      Batal Bisu
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
