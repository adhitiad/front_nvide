"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { useSession } from "@/lib/auth-client";
import { useUserStore } from "@/store/useUserStore";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession() as any;
  const { user, fetchProfile, fetchWallet, setUser } = useUserStore();

  // Sync session user to user store & fetch wallet
  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
      fetchProfile();
      fetchWallet();
    }
  }, [session, fetchProfile, fetchWallet, setUser]);

  // Auth Guard redirect
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  // If loading session, show beautiful immersive skeleton loader
  if (isPending || (!session && isPending)) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-sm text-neutral-400 font-medium tracking-wide">
          Memuat sesi aman NVide Live...
        </p>
      </div>
    );
  }

  // If unauthorized at all (session check fails after load)
  if (!session) {
    return null; // redirecting
  }

  // Role-Based Route Protection Guard
  const userRole = session.user?.role || "user";
  const isAdminRoute = pathname?.includes("/dashboard/moderation");
  
  if (isAdminRoute && userRole !== "admin") {
    return (
      <div className="h-full relative bg-neutral-950">
        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
          <Sidebar />
        </div>
        <main className="md:pl-72 flex flex-col h-full">
          <Navbar />
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6">
            <div className="h-20 w-20 bg-red-500/10 border border-red-500/30 rounded-3xl flex items-center justify-center text-red-500 shadow-xl shadow-red-500/5 animate-bounce">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Akses Ditolak!</h2>
              <p className="text-neutral-400 text-sm">
                Maaf, Halaman Moderasi & Keamanan ini hanya dapat diakses oleh Administrator dengan kredensial tingkat tinggi.
              </p>
            </div>
            <Button 
              onClick={() => router.replace("/dashboard")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-6 rounded-xl shadow-lg"
            >
              Kembali ke Dasbor Utama
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-full relative bg-neutral-950">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <Sidebar />
      </div>
      <main className="md:pl-72 flex flex-col h-full">
        <Navbar />
        <div className="flex-1 p-8 text-white">
          {children}
        </div>
      </main>
    </div>
  );
}
