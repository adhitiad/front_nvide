"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
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
import { Mail, Lock, ArrowRight } from "lucide-react";
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
      if (result?.error) {
        toast.error("Login Gagal: " + result.error.message);
      }
    } catch (error: any) {
      console.error("Login Gagal", error);
      toast.error("Terjadi kesalahan: " + (error.message || "Unknown error"));
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password harus diisi");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (error) {
        toast.error("Login Gagal: " + error.message);
      } else {
        toast.success("Login Berhasil! Mengalihkan...");
      }
    } catch (err: any) {
      toast.error("Terjadi kesalahan: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>

      <div className="z-10 w-full max-w-md p-4 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-black text-xl italic">N</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              NVide<span className="text-indigo-500">.Live</span>
            </span>
          </div>
        </div>

        <Card className="bg-neutral-900/40 border-neutral-800 backdrop-blur-xl shadow-2xl overflow-hidden rounded-3xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-white text-center">
              Selamat Datang Kembali
            </CardTitle>
            <CardDescription className="text-neutral-400 text-center">
              Pilih metode masuk untuk melanjutkan ke dashboard Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Login Button - Primary */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <GoogleIcon />
              Masuk dengan Google
              <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-800"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0b0b0b] px-2 text-neutral-500">
                  Atau gunakan email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="space-y-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    className="pl-10 bg-neutral-800/50 border-neutral-700 text-white rounded-xl h-11 focus-visible:ring-indigo-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-neutral-800/50 border-neutral-700 text-white rounded-xl h-11 focus-visible:ring-indigo-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl mt-4"
              >
                Masuk Sekarang
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <div className="text-center text-sm">
              <span className="text-neutral-500">Belum punya akun? </span>
              <Link href="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                Daftar Gratis
              </Link>
            </div>
          </CardFooter>
        </Card>

        <p className="mt-8 text-center text-xs text-neutral-600 px-6 leading-relaxed">
          Dengan masuk, Anda menyetujui{" "}
          <span className="underline cursor-pointer">Syarat & Ketentuan</span>{" "}
          serta{" "}
          <span className="underline cursor-pointer">Kebijakan Privasi</span>{" "}
          kami.
        </p>
      </div>
    </div>
  );
}
