"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  is_verified: boolean;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get("/auth/me") as any;
        setProfile(data.user || data);
      } catch (err) {
        console.error("Gagal memuat profil", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center text-neutral-400">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-neutral-400 mt-2">Selamat datang kembali di NVide Live Platform</p>
      </div>
      
      <Card className="bg-[#111827] border-neutral-800 text-neutral-100">
        <CardHeader>
          <CardTitle>Profil Anda</CardTitle>
          <CardDescription className="text-neutral-400">Informasi pengguna yang sedang login</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-neutral-400">Username</p>
                <p className="font-medium text-lg">{profile.username}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Email</p>
                <p className="font-medium text-lg">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Role</p>
                <p className="font-medium text-lg capitalize">{profile.role}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Status Verifikasi</p>
                <p className="font-medium text-lg">
                  {profile.is_verified ? (
                    <span className="text-emerald-400">Terverifikasi</span>
                  ) : (
                    <span className="text-amber-400">Belum Terverifikasi</span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-red-400">Gagal memuat profil</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
