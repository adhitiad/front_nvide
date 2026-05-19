"use client";

import React, { useState, useEffect } from "react";
import { useThemeStore, Theme } from "@/store/useThemeStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Laptop, Sparkles } from "lucide-react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();
  const t = useLanguageStore((state) => state.t);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set theme class on document once mounted on client
  useEffect(() => {
    setMounted(true);
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  if (!mounted) return null;

  const themes: { code: Theme; icon: any; labelKey: string }[] = [
    { code: "light", icon: Sun, labelKey: "theme.light" },
    { code: "dark", icon: Moon, labelKey: "theme.dark" },
    { code: "system", icon: Laptop, labelKey: "theme.system" },
  ];

  const currentTheme = themes.find((th) => th.code === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-full border border-primary/30 bg-card hover:bg-primary/10 text-foreground transition-all anime-pulse-hover shadow-sm"
      >
        <CurrentIcon className="h-4.5 w-4.5 text-primary anime-sparkle" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.1] }}
              className="absolute right-0 mt-2 w-44 rounded-2xl bg-card border border-primary/20 shadow-xl overflow-hidden py-1 z-50"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-primary tracking-wider uppercase border-b border-primary/10 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Select Theme
              </div>
              {themes.map((th) => {
                const Icon = th.icon;
                return (
                  <button
                    key={th.code}
                    onClick={() => {
                      setTheme(th.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm font-semibold hover:bg-primary/10 transition-colors ${
                      theme === th.code ? "text-primary bg-primary/5" : "text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t(th.labelKey)}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
