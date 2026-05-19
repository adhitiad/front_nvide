"use client";

import React, { useState, useEffect } from "react";
import { useLanguageStore, LANGUAGES, Language } from "@/store/useLanguageStore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage, loadTranslations } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initial translation load
    loadTranslations(language);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const handleSelect = async (code: Language) => {
    await setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-card hover:bg-primary/10 text-foreground font-medium text-sm transition-all anime-pulse-hover shadow-sm"
      >
        <span className="text-base">{currentLang.flag}</span>
        <span className="hidden sm:inline text-xs font-semibold tracking-wide uppercase">{currentLang.code}</span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay click-away */}
            <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.1] }}
              className="absolute right-0 mt-2 w-52 rounded-2xl bg-card border border-primary/20 shadow-xl overflow-hidden py-1"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-primary tracking-wider uppercase border-b border-primary/10 flex items-center gap-1">
                <Globe className="h-3 w-3 anime-sparkle" />
                Select Language
              </div>
              <div className="max-h-64 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm font-semibold hover:bg-primary/10 transition-colors ${
                      language === lang.code ? "text-primary bg-primary/5" : "text-foreground"
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="flex-1">{lang.name}</span>
                    {language === lang.code && (
                      <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                        ACTIVE
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
