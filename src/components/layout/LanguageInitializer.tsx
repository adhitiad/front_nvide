"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";

export default function LanguageInitializer() {
  const { language, loadTranslations } = useLanguageStore();

  useEffect(() => {
    const init = async () => {
      await loadTranslations(language);
    };
    void init();
  }, [language, loadTranslations]);

  return null;
}
