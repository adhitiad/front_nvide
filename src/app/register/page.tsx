"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
  </svg>
);

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error: any) {
      toast.error("Gagal mendaftar dengan Google: " + error.message);
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Semua kolom harus diisi");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/dashboard",
      });

      if (error) {
        toast.error("Gagal mendaftar: " + error.message);
      } else {
        toast.success("Pendaftaran Berhasil! Mengalihkan...");
      }
    } catch (err: any) {
      toast.error("Terjadi kesalahan: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden p-6">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[140px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[140px] rounded-full"></div>

      <div className="z-10 w-full max-w-lg animate-in fade-in zoom-in duration-700">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-12 w-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-2xl italic">N</span>
            </div>
            <span className="text-3xl font-bold text-white tracking-tighter">
              NVide<span className="text-indigo-500">.Live</span>
            </span>
          </Link>
        </div>

        <Card className="bg-neutral-900/40 border-neutral-800 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden border-t-indigo-500/30">
          <CardHeader className="space-y-2 pb-8 pt-10">
            <div className="flex justify-center mb-2">
              <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Join the Future of Streaming</span>
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-white text-center tracking-tight">
              Buat Akun Baru
            </CardTitle>
            <CardDescription className="text-neutral-400 text-center text-base">
              Mulai perjalanan streaming Anda bersama ribuan kreator lainnya
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-5 px-8">
            <Button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full h-14 bg-white text-black hover:bg-neutral-200 font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <GoogleIcon />
              Daftar dengan Google
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-800"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0b0b0b] px-4 text-neutral-500 font-medium tracking-widest">
                  Atau gunakan email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                  <Input
                    placeholder="Nama Lengkap"
                    className="pl-12 bg-neutral-800/30 border-neutral-800 text-white rounded-2xl h-14 focus-visible:ring-indigo-500 focus-visible:bg-neutral-800/50 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    className="pl-12 bg-neutral-800/30 border-neutral-800 text-white rounded-2xl h-14 focus-visible:ring-indigo-500 focus-visible:bg-neutral-800/50 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                  <Input
                    type="password"
                    placeholder="Password (min. 8 karakter)"
                    className="pl-12 bg-neutral-800/30 border-neutral-800 text-white rounded-2xl h-14 focus-visible:ring-indigo-500 focus-visible:bg-neutral-800/50 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl mt-4 shadow-lg shadow-indigo-600/20 group"
              >
                {isLoading ? "Memproses..." : "Daftar Sekarang"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-6 pb-10 pt-4 px-8">
            <div className="text-center text-sm">
              <span className="text-neutral-500">Sudah punya akun? </span>
              <Link href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors underline underline-offset-4">
                Masuk di sini
              </Link>
            </div>
            
            <p className="text-center text-[11px] text-neutral-600 leading-relaxed max-w-[280px] mx-auto">
              Dengan mendaftar, Anda menyetujui <span className="text-neutral-500 cursor-pointer">Syarat Layanan</span> & <span className="text-neutral-500 cursor-pointer">Kebijakan Privasi</span> kami.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
