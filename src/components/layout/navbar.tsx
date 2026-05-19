"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Sparkles, User } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useUserStore } from "@/store/useUserStore";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const { user, logout } = useUserStore();

  const handleLogout = async () => {
    logout();
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    } catch (error) {
      console.error("Gagal keluar:", error);
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-card/85 backdrop-blur-md border-b border-primary/20 px-4 py-2.5 flex items-center justify-between shadow-[0_2px_12px_rgba(244,143,177,0.1)]">
      {/* Brand logo for mobile */}
      <div className="flex items-center gap-2 md:hidden">
        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={onMenuClick}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground font-black text-sm anime-sparkle shadow-md">
          NV
        </div>
        <span className="font-heading text-lg font-black text-primary flex items-center gap-0.5">
          NVide <span className="text-[10px] bg-accent text-accent-foreground px-1 py-0.2 rounded-md font-bold">18+</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary anime-sparkle" />
        <span className="text-xs font-bold text-muted-foreground">Welcome back, Onii-chan / Onee-sama!</span>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeSwitcher />
        
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-primary/10">
            <div className="h-8 w-8 rounded-full border border-primary bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm relative group">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4" />
              )}
              {/* Gold sparkle overlay */}
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-accent" />
              </div>
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-foreground truncate max-w-24">{user.username}</span>
              <span className="text-[9px] font-semibold text-primary uppercase tracking-wider">{user.role}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => router.push("/login")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-4 text-xs shadow-md anime-pulse-hover"
          >
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
export default Navbar;
