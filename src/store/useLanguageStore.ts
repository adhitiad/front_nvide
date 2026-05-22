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
  loading: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, defaultText?: string) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "id",
      loading: false,

      setLanguage: async (lang) => {
        set({ loading: true });
        try {
          await i18n.changeLanguage(lang);
          set({ language: lang, loading: false });
        } catch (e) {
          console.error("Error changing language", e);
          set({ loading: false });
        }
      },

      t: (key, defaultText) =>
        i18n.exists(key, { ns: "translation" }) ? i18n.t(key, { ns: "translation" }) : (defaultText || key),
    }),
    {
      name: "language-storage",
      partialize: (state) => ({ language: state.language }), // only persist language code
    }
  )
);
