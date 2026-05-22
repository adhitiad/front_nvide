"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";

export default function LanguageInitializer() {
  const { language, setLanguage } = useLanguageStore();

  useEffect(() => {
    const init = async () => {
      await setLanguage(language);
    };
    void init();
  }, [language, setLanguage]);

  return null;
}
