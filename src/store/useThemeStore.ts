import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => {
        set({ theme });
        // Handle next-themes or document class manually if needed, 
        // though next-themes handles most of it, we store it in zustand for ease of use.
        if (typeof window !== "undefined") {
          const root = window.document.documentElement;
          root.classList.remove("light", "dark");
          
          if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            root.classList.add(systemTheme);
          } else {
            root.classList.add(theme);
          }
        }
      },
    }),
    {
      name: "theme-storage",
    }
  )
);
