"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useUserStore } from "@/store/useUserStore";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  ShieldCheck, 
  Settings as SettingsIcon, 
  User, 
  Mail, 
  Volume2, 
  Smartphone,
  Sparkles,
  Zap,
  Phone,
  MessageSquare,
  Coins
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { user } = useUserStore();
  const {
    permission,
    requestPermission,
    simulateCallNotification,
    simulateDMNotification,
    simulateDepositNotification,
    isSupported
  } = usePushNotifications();

  const handleEnableNotification = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success("Push Notification berhasil diaktifkan!");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Settings Header */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900/40 border border-neutral-800 p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-2 text-indigo-400 text-sm font-bold uppercase tracking-wider">
          <SettingsIcon className="h-4 w-4 animate-spin" />
          Pengaturan Akun & Aplikasi
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">
          Pusat Kontrol & Notifikasi
        </h1>
        <p className="text-neutral-400 text-sm max-w-xl">
          Kelola preferensi akun Anda, integrasikan perangkat pemberitahuan push native, dan atur keamanan tingkat lanjut di NVide Live.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PANEL 1: PROFIL PENGGUNA */}
        <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md text-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-indigo-400">
              <User className="h-5 w-5" />
              Detail Profil Keamanan
            </CardTitle>
            <CardDescription className="text-neutral-400 text-xs">
              Informasi dasar kredensial akun terotentikasi Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1 p-3 bg-neutral-950 border border-neutral-800/80 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-neutral-500">Nama Lengkap</span>
              <p className="font-bold text-sm text-white flex items-center gap-2">
                {session?.user?.name || "Nama Pengguna"}
                <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full text-[9px] font-bold">
                  {user?.role?.toUpperCase() || session?.user?.role?.toUpperCase() || "GUEST"}
                </span>
              </p>
            </div>

            <div className="space-y-1 p-3 bg-neutral-950 border border-neutral-800/80 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-neutral-500">Alamat Email</span>
              <p className="font-bold text-sm text-neutral-300 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-neutral-500" />
                {session?.user?.email || "email@domain.com"}
              </p>
            </div>

            <div className="space-y-1 p-3 bg-neutral-950 border border-neutral-800/80 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-neutral-500">Status Keamanan Akun</span>
              <p className="font-bold text-sm text-green-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Terlindungi oleh Better-Auth JWT
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PANEL 2: INTEGRASI PUSH NOTIFICATION */}
        <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md text-white border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-pink-400">
              <Bell className="h-5 w-5" />
              Notifikasi Push Native
            </CardTitle>
            <CardDescription className="text-neutral-400 text-xs">
              Aktifkan izin sistem browser untuk menerima notifikasi real-time bahkan saat web ditutup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex justify-between items-center text-xs">
              <div className="space-y-1">
                <p className="font-bold text-white">Status Izin Push Browser</p>
                <p className="text-[10px] text-neutral-500">
                  {permission === "granted" ? "Notifikasi diaktifkan penuh" : "Notifikasi diblokir atau belum diatur"}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                permission === "granted" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
              }`}>
                {permission.toUpperCase()}
              </span>
            </div>

            {permission !== "granted" ? (
              <Button
                onClick={handleEnableNotification}
                disabled={!isSupported}
                className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <Smartphone className="h-4 w-4" />
                Aktifkan Push Notifikasi Sekarang
              </Button>
            ) : (
              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-3.5 text-center text-xs text-green-400 font-semibold flex items-center justify-center gap-2">
                <Volume2 className="h-4 w-4 animate-bounce" />
                Notifikasi Push Browser Aktif & Siap Menerima Panggilan
              </div>
            )}
          </CardContent>
        </Card>

        {/* INTEGRATED TESTING CENTER: SIMULASI NOTIFIKASI */}
        {permission === "granted" && (
          <Card className="md:col-span-2 bg-gradient-to-tr from-neutral-900 via-neutral-900 to-indigo-950/20 border-indigo-500/30 text-white">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-400">
                <Zap className="h-5 w-5" />
                NVide Sandbox: Simulasi Push Notification Native
              </CardTitle>
              <CardDescription className="text-neutral-400 text-xs">
                Gunakan tombol sandbox di bawah untuk menguji responsivitas push notification pada sistem operasi Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <Button
                onClick={() => simulateCallNotification("Aura Kasih", "room_018f3a3c")}
                className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs py-5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-md group"
              >
                <Phone className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Simulasi Panggilan</span>
                <span className="text-[9px] text-neutral-500">Panggilan Video Masuk</span>
              </Button>

              <Button
                onClick={() => simulateDMNotification("Chandra Liow", "Bro, streaming bareng yuk nanti malam jam 8!")}
                className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs py-5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-md group"
              >
                <MessageSquare className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Simulasi Pesan</span>
                <span className="text-[9px] text-neutral-500">Notif DM Chat Masuk</span>
              </Button>

              <Button
                onClick={() => simulateDepositNotification(5000)}
                className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs py-5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-md group"
              >
                <Coins className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Simulasi Deposit</span>
                <span className="text-[9px] text-neutral-500">Wallet Top Up Koin</span>
              </Button>

            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
