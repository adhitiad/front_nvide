"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useUserStore } from "@/store/useUserStore";
import api from "@/lib/api";
import { motion } from "framer-motion";
import {
  Settings,
  Crown,
  Star,
  ShieldCheck,
  Wallet,
  History,
  LogOut,
  ChevronRight,
  Bell,
  Users,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ProfileStats {
  following_count: number;
  followers_count: number;
  visitor_count: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { user, wallet, fetchProfile, fetchWallet } = useUserStore();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch real profile, wallet, and social stats on mount
  useEffect(() => {
    fetchProfile();
    fetchWallet();

    // Fetch follow/follower stats from backend
    async function loadStats() {
      try {
        setStatsLoading(true);
        const res: any = await api.get("/users/me/stats");
        setStats(res.data || null);
      } catch {
        // Stats API may not be fully implemented yet
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
  }, [fetchProfile, fetchWallet]);

  const coinBalance = wallet ? Math.floor(wallet.balance / 100) : 0;
  const followingCount = stats?.following_count ?? 0;
  const followersCount = stats?.followers_count ?? 0;
  const visitorCount = stats?.visitor_count ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header Profile Section */}
      <div className="relative bg-gradient-to-b from-primary/20 to-background pt-12 pb-6 px-4">
        <div className="absolute top-4 right-4 flex gap-3">
          <button className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-primary bg-card overflow-hidden">
              <Image
                src={
                  session?.user?.image ||
                  user?.avatar_url ||
                  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200"
                }
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            {/* VIP Badge */}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full p-1 border-2 border-background shadow-md anime-pulse-hover cursor-pointer">
              <Crown className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-heading font-black">
              {user?.username || session?.user?.name || "Guest User"}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold mb-2">
              ID: {user?.id?.slice(0, 8)?.toUpperCase() || "N/A"}
            </p>

            <div className="flex gap-2">
              <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                Lv. {user?.user_level ?? 1} User
              </span>
              <span className="bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-amber-600 border border-amber-500/30 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />{" "}
                {user?.role === "host"
                  ? "Host"
                  : user?.role === "admin"
                    ? "Admin"
                    : "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Following / Followers / Visitors */}
        <div className="flex justify-around mt-8 bg-card rounded-2xl p-4 shadow-sm border border-primary/10">
          <div className="flex flex-col items-center">
            <span className="font-heading font-black text-lg">
              {statsLoading ? "..." : followingCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">
              Following
            </span>
          </div>
          <div className="w-px bg-border/50" />
          <div className="flex flex-col items-center">
            <span className="font-heading font-black text-lg">
              {statsLoading
                ? "..."
                : followersCount >= 1000
                  ? `${(followersCount / 1000).toFixed(1)}k`
                  : followersCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">
              Followers
            </span>
          </div>
          <div className="w-px bg-border/50" />
          <div className="flex flex-col items-center">
            <span className="font-heading font-black text-lg">
              {statsLoading ? "..." : visitorCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">
              Visitors
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-2">
        {/* Wallet & Topup */}
        <div className="bg-card rounded-2xl p-4 flex items-center justify-between shadow-sm border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                My Wallet
              </p>
              <p className="font-heading font-black text-lg text-foreground flex items-center gap-1">
                <span className="text-yellow-500">🪙</span>{" "}
                {coinBalance.toLocaleString()}
              </p>
            </div>
          </div>
          <button className="bg-primary text-primary-foreground font-bold text-xs px-4 py-2 rounded-full hover:scale-105 transition shadow-md">
            Top Up
          </button>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-4 gap-3 bg-card rounded-2xl p-4 shadow-sm border border-primary/10">
          {[
            {
              icon: Crown,
              label: "VIP Center",
              color: "text-amber-500",
              bg: "bg-amber-500/10",
              href: "/vip",
            },
            {
              icon: Users,
              label: "My Family",
              color: "text-indigo-500",
              bg: "bg-indigo-500/10",
              href: "/family",
            },
            {
              icon: ShieldCheck,
              label: "Agency",
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
              href: "/agency",
            },
            {
              icon: Star,
              label: "Tasks",
              color: "text-pink-500",
              bg: "bg-pink-500/10",
              href: "/tasks",
            },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition`}
              >
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <span className="text-[10px] font-bold text-center leading-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* List Menu */}
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-primary/10">
          {[
            { icon: History, label: "Watch History" },
            { icon: Wallet, label: "Transaction Record" },
            { icon: Settings, label: "Settings" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border-b border-border/50 last:border-0 active:bg-muted/50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-bold text-sm">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>

        {/* Logout */}
        <button className="w-full bg-card rounded-2xl p-4 flex items-center justify-center gap-2 text-destructive font-bold text-sm shadow-sm border border-destructive/20 hover:bg-destructive/10 transition">
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>
    </div>
  );
}
