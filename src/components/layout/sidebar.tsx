"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Video, Users, Wallet, Settings, MessageSquare, ShieldAlert } from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Live Streams",
    icon: Video,
    href: "/dashboard/streams",
    color: "text-violet-500",
  },
  {
    label: "Messages (DM)",
    icon: MessageSquare,
    href: "/dashboard/chat",
    color: "text-blue-500",
  },
  {
    label: "Social / Story",
    icon: Users,
    href: "/dashboard/social",
    color: "text-pink-700",
  },
  {
    label: "Wallet",
    icon: Wallet,
    href: "/dashboard/wallet",
    color: "text-emerald-500",
  },
  {
    label: "Moderasi & Keamanan",
    icon: ShieldAlert,
    href: "/dashboard/moderation",
    color: "text-red-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white border-r border-neutral-800">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold text-white">NVide</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
