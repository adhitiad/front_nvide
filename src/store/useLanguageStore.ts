import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "@/lib/i18n";

export type Language = 'en' | 'id' | 'zh' | 'fil' | 'th' | 'ms' | 'my' | 'km' | 'es' | 'vi' | 'pt-BR';

export interface LanguageInfo {
  code: Language;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "id", name: "Indonesia", flag: "🇮🇩" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "fil", name: "Filipino", flag: "🇵🇭" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "ms", name: "Melayu", flag: "🇲🇾" },
  { code: "my", name: "Myanmar", flag: "🇲🇲" },
  { code: "km", name: "Khmer", flag: "🇰🇭" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "pt-BR", name: "Português", flag: "🇧🇷" },
];

interface LanguageState {
  language: Language;
  translations: Record<string, any>;
  loading: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  loadTranslations: (lang: Language) => Promise<void>;
  t: (key: string, defaultText?: string) => string;
}

// Fallback translations included statically to prevent hydration flicker for common elements
const fallbackEN: Record<string, any> = {
  "nav": {
    "home": "Home",
    "streams": "Streams",
    "wallet": "Wallet",
    "profile": "Profile",
    "admin": "Admin Panel",
    "host": "Host Panel",
    "agency": "Agency Panel"
  },
  "theme": {
    "light": "Sweet Light",
    "dark": "Neon Dark",
    "system": "OS Harmony"
  }
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "en",
      translations: fallbackEN,
      loading: false,

      setLanguage: async (lang) => {
        set({ language: lang });
        await get().loadTranslations(lang);
        await i18n.changeLanguage(lang);
      },

      loadTranslations: async (lang) => {
        set({ loading: true });
        try {
          const res = await fetch(`/locales/${lang}/common.json`);
          if (res.ok) {
            const data = await res.json();
            i18n.addResourceBundle(lang, "common", data, true, true);
            await i18n.changeLanguage(lang);
            set({ translations: data, loading: false });
          } else {
            console.error("Failed to load translation file", lang);
            set({ loading: false });
          }
        } catch (e) {
          console.error("Error fetching translation", e);
          set({ loading: false });
        }
      },

      t: (key, defaultText) =>
        i18n.exists(key, { ns: "common" }) ? i18n.t(key, { ns: "common" }) : (defaultText || key),
    }),
    {
      name: "language-storage",
      partialize: (state) => ({ language: state.language }), // only persist language code
    }
  )
);
