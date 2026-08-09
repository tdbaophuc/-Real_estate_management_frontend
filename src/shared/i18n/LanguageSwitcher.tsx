import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { supportedLanguages, type SupportedLanguage } from ".";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const currentLanguage: SupportedLanguage = i18n.language === "vi" ? "vi" : "en";

  return (
    <label className="language-switcher">
      <Languages size={15} aria-hidden="true" />
      <span>{t("language.label")}</span>
      <select
        aria-label={t("language.ariaLabel")}
        value={currentLanguage}
        onChange={(event) => {
          void i18n.changeLanguage(event.target.value);
        }}
      >
        {supportedLanguages.map((language) => (
          <option key={language} value={language}>
            {language === "en" ? t("language.english") : t("language.vietnamese")}
          </option>
        ))}
      </select>
    </label>
  );
}
