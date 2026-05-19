"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

export default function ThemeInitializer() {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (currentTheme: "light" | "dark" | "system") => {
      root.classList.remove("light", "dark");
      if (currentTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
        return;
      }
      root.classList.add(currentTheme);
    };

    applyTheme(theme);

    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme("system");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  return null;
}
