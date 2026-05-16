"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(username, email, password);
      // Setelah register berhasil, langsung ke halaman login
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat pendaftaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950">
      <Card className="w-full max-w-md bg-neutral-900 border-neutral-800 text-neutral-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Daftar Akun Baru</CardTitle>
          <CardDescription className="text-neutral-400 text-center">
            Buat akun NVide Anda untuk mulai live streaming
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-neutral-300">Username</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="johndoe" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-neutral-950 border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nama@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-neutral-950 border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-300">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-neutral-950 border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus-visible:ring-indigo-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all" 
              disabled={loading}
            >
              {loading ? "Loading..." : "Daftar"}
            </Button>
            <div className="text-sm text-center text-neutral-400">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                Masuk di sini
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
