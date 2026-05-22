import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "@/locales/en";
import { id } from "@/locales/id";
import { zh } from "@/locales/zh";
import { fil } from "@/locales/fil";
import { th } from "@/locales/th";
import { ms } from "@/locales/ms";
import { my } from "@/locales/my";
import { km } from "@/locales/km";
import { es } from "@/locales/es";
import { vi } from "@/locales/vi";
import { ptBR } from "@/locales/pt-BR";

const resources = {
  en: { translation: en },
  id: { translation: id },
  zh: { translation: zh },
  fil: { translation: fil },
  th: { translation: th },
  ms: { translation: ms },
  my: { translation: my },
  km: { translation: km },
  es: { translation: es },
  vi: { translation: vi },
  "pt-BR": { translation: ptBR },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "id",
    fallbackLng: "en",
    defaultNS: "translation",
    ns: ["translation"],
    interpolation: { escapeValue: false },
  });
}

export default i18n;
