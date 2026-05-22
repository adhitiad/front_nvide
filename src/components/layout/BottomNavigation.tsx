"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Video, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Shorts", href: "/shorts", icon: Video },
  { name: "Updates", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  // Hide bottom nav on specific fullscreen pages like live streams
  if (pathname.startsWith("/streams/") || pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-primary rounded-b-md anime-sparkle shadow-[0_0_8px_var(--primary)]" />
              )}
              <item.icon className={cn("w-6 h-6", isActive && "animate-bounce")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
