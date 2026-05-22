"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useUserStore } from "@/store/useUserStore";
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  Wallet, 
  Settings, 
  MessageSquare, 
  ShieldAlert, 
  Calendar, 
  Building2,
  FileCheck,
  TrendingUp,
  UserCheck,
  Sparkles,
  Play
} from "lucide-react";

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const { user } = useUserStore();
  const { t } = useTranslation();

  const isAdminPanel = pathname.startsWith("/admin");

  // Rute khusus untuk Panel Admin
  const adminRoutes = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      tab: "overview",
      href: "/admin?tab=overview",
      color: "text-pink-500",
    },
    {
      label: "Users",
      icon: Users,
      tab: "users",
      href: "/admin?tab=users",
      color: "text-violet-500",
    },
    {
      label: "Hosts",
      icon: UserCheck,
      tab: "hosts",
      href: "/admin?tab=hosts",
      color: "text-sky-500",
    },
    {
      label: "Agencies",
      icon: Building2,
      tab: "agencies",
      href: "/admin?tab=agencies",
      color: "text-amber-500",
    },
    {
      label: "KYC Verification",
      icon: FileCheck,
      tab: "kyc",
      href: "/admin?tab=kyc",
      color: "text-emerald-500",
    },
    {
      label: "Reports",
      icon: ShieldAlert,
      tab: "reports",
      href: "/admin?tab=reports",
      color: "text-rose-500",
    },
    {
      label: "Revenue",
      icon: TrendingUp,
      tab: "revenue",
      href: "/admin?tab=revenue",
      color: "text-yellow-500",
    },
    {
      label: "Settings",
      icon: Settings,
      tab: "settings",
      href: "/admin?tab=settings",
      color: "text-slate-500",
    },
  ];

  const dashboardRoutes = [
    {
      label: t("common.nav.dashboard", "Dashboard"),
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-pink-500",
    },
    {
      label: t("common.nav.streams", "Live Streams"),
      icon: Video,
      href: "/dashboard/streams",
      color: "text-violet-500",
    },
    {
      label: t("common.nav.bookings", "Bookings"),
      icon: Calendar,
      href: "/dashboard/bookings",
      color: "text-indigo-500",
    },
    {
      label: t("common.nav.host", "Host Panel"),
      icon: Play,
      href: "/dashboard/host",
      color: "text-rose-500",
    },
    {
      label: t("common.nav.hostPayout", "Host Payout"),
      icon: Wallet,
      href: "/dashboard/host/payout",
      color: "text-emerald-500",
    },
    {
      label: t("common.nav.agency", "Agency Partner"),
      icon: Building2,
      href: "/dashboard/agency",
      color: "text-amber-500",
    },
    {
      label: t("common.nav.agencyPayout", "Agency Payout"),
      icon: Wallet,
      href: "/dashboard/agency/payout",
      color: "text-emerald-500",
    },
    {
      label: t("common.nav.messages", "Messages (DM)"),
      icon: MessageSquare,
      href: "/dashboard/chat",
      color: "text-sky-500",
    },
    {
      label: t("common.nav.social", "Social / Story"),
      icon: Users,
      href: "/dashboard/social",
      color: "text-teal-500",
    },
    {
      label: t("common.nav.wallet", "Wallet"),
      icon: Wallet,
      href: "/dashboard/wallet",
      color: "text-emerald-500",
    },
    {
      label: t("common.nav.settings", "Settings"),
      icon: Settings,
      href: "/dashboard/settings",
      color: "text-slate-500",
    },
  ];

  const routes = isAdminPanel ? adminRoutes : dashboardRoutes;

  return (
    <div className="space-y-4 py-6 flex flex-col h-full bg-card/60 backdrop-blur-lg border-r border-primary/20 text-foreground">
      <div className="px-6 py-2 flex-1">
        <Link href="/" className="flex items-center gap-2 mb-10 pl-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground font-black text-lg anime-sparkle shadow-md">
            NV
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl font-black text-primary leading-tight flex items-center gap-1">
              NVide <span className="text-[9px] bg-accent text-accent-foreground px-1.5 py-0.2 rounded-md font-extrabold shadow-sm">18+</span>
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {isAdminPanel ? "Admin Headquarters" : "Live Streaming Portal"}
            </span>
          </div>
        </Link>

        {/* User Card inside Sidebar */}
        {user && (
          <div className="mx-2 mb-8 p-3 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-primary/30 overflow-hidden bg-background">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{user.username}</p>
              <p className="text-[9px] font-semibold text-primary uppercase tracking-wide">{user.role}</p>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {routes.map((route) => {
            const Icon = route.icon;
            // Check active state
            const isActive = isAdminPanel
              ? activeTab === (route as any).tab
              : pathname === route.href || (route.href !== "/dashboard" && pathname.startsWith(route.href));

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-xs group flex p-3 w-full justify-start font-bold cursor-pointer rounded-2xl transition-all duration-300 relative anime-pulse-hover",
                  isActive 
                    ? "text-primary bg-primary/10 border-l-4 border-primary shadow-sm" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                <div className="flex items-center flex-1">
                  <Icon className={cn("h-4.5 w-4.5 mr-3 transition-transform group-hover:scale-110", route.color || "text-slate-400")} />
                  {route.label}
                </div>
                {isActive && (
                  <span className="text-[10px] text-accent anime-sparkle absolute right-3">
                    ✦
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-2 border-t border-primary/10 flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-accent anime-sparkle" />
        <span>V1.0.0 — Pure Anime Magic</span>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <React.Suspense fallback={
      <div className="w-64 h-full bg-card/60 backdrop-blur-lg border-r border-primary/20 flex flex-col justify-between py-6">
        <div className="px-6 py-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground font-black text-lg shadow-md animate-pulse">
            NV
          </div>
        </div>
      </div>
    }>
      <SidebarContent />
    </React.Suspense>
  );
}

export default Sidebar;
