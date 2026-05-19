"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Home, Compass, Wallet, Bell, User } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();
  const t = useLanguageStore((state) => state.t);

  const items = [
    { label: t("nav.home", "Home"), icon: Home, href: "/" },
    { label: "Jelajah", icon: Compass, href: "/streams" },
    { label: t("nav.wallet", "Wallet"), icon: Wallet, href: "/dashboard/wallet" },
    { label: "Notifikasi", icon: Bell, href: "/dashboard/notifications" },
    { label: t("nav.profile", "Profile"), icon: User, href: "/dashboard/settings" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-primary/20 flex items-center justify-around px-2 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] rounded-t-2xl">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center flex-1 py-1">
            {isActive && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute -top-1 w-12 h-1 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            
            <div className={`p-1 rounded-full transition-transform duration-300 ${isActive ? "text-primary scale-110" : "text-muted-foreground"}`}>
              <Icon className="h-5 w-5" />
            </div>
            
            <span className={`text-[10px] font-bold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              {item.label}
            </span>

            {isActive && (
              <span className="absolute top-1 right-4 text-[6px] text-accent anime-sparkle">
                ✦
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
