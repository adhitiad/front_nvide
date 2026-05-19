"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import BottomNav from "@/components/layout/BottomNav";
import { authClient, useSession } from "@/lib/auth-client";
import { useUserStore } from "@/store/useUserStore";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { user, fetchProfile, fetchWallet, setUser } = useUserStore();

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
      fetchProfile();
      fetchWallet();
    }
  }, [session, fetchProfile, fetchWallet, setUser]);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-semibold tracking-wide">
          Connecting to NVide Admin channels...
        </p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // User Banned Guard
  const isBanned = session.user?.banned === true || session.user?.status === "banned" || user?.banned === true;
  
  if (isBanned) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-neutral-900 border-2 border-red-500 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 animate-pulse"></div>
          <div className="h-20 w-20 bg-red-950/40 border border-red-900/60 rounded-full flex items-center justify-center text-red-500 mx-auto shadow-lg animate-bounce">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-red-500 tracking-tight">Akun Anda telah dibanned permanen. Tidak ada banding.</h2>
            <p className="text-neutral-200 text-sm font-semibold leading-relaxed">
              Akun Anda telah dibanned permanen. Tidak ada banding.
            </p>
            <p className="text-neutral-500 text-xs mt-3">
              Sistem telah mendeteksi pelanggaran serius terhadap Kebijakan Keamanan dan Konten Platform (LGBTQ+ content restrictions / violations). Keputusan ini bersifat mutlak.
            </p>
          </div>
          <Button
            onClick={async () => {
              try { await authClient.signOut(); } catch { /* ignore */ }
              window.location.href = "/login";
            }}
            className="w-full bg-red-650 hover:bg-red-750 text-white font-bold rounded-2xl h-11"
          >
            Keluar dari Sistem
          </Button>
        </div>
      </div>
    );
  }

  const userRole = session.user?.role || "user";
  if (userRole !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center text-center p-8 max-w-xl mx-auto space-y-6">
        <div className="h-20 w-20 bg-destructive/10 border border-destructive/30 rounded-3xl flex items-center justify-center text-destructive shadow-xl animate-bounce">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Access Denied! / Akses Ditolak</h2>
          <p className="text-muted-foreground text-sm">
            Maaf, Panel Admin ini hanya dapat diakses oleh Administrator dengan kredensial penuh.
          </p>
        </div>
        <Button 
          onClick={() => router.replace("/dashboard")}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs py-2 px-6 rounded-xl shadow-lg"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full relative bg-background text-foreground flex flex-col md:flex-row">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <Sidebar />
      </div>
      <main className="md:pl-72 flex flex-col flex-1 min-h-screen pb-16 md:pb-0">
        <Navbar />
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

