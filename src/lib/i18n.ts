import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const fallbackResources = {
  en: {
    common: {
      nav: {
        home: "Home",
        streams: "Streams",
        wallet: "Wallet",
        profile: "Profile",
      },
      theme: {
        light: "Sweet Light",
        dark: "Neon Dark",
        system: "OS Harmony",
      },
    },
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: fallbackResources,
    lng: "en",
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
  });
}

export default i18n;
