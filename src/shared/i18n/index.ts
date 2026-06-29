import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import vi from "./vi.json";

export const supportedLanguages = ["en", "vi"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const storageKey = "app-language";

function getInitialLanguage(): SupportedLanguage {
  const storedLanguage = window.localStorage.getItem(storageKey);

  if (storedLanguage === "en" || storedLanguage === "vi") {
    return storedLanguage;
  }

  return "en";
}

void i18n.use(initReactI18next).init({
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  },
  lng: getInitialLanguage(),
  resources: {
    en: { translation: en },
    vi: { translation: vi }
  }
});

i18n.on("languageChanged", (language) => {
  if (language === "en" || language === "vi") {
    window.localStorage.setItem(storageKey, language);
  }
});

export { i18n };
