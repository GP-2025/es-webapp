import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import arTranslations from "./locales/ar.json";
import enTranslations from "./locales/en.json";

// Get browser language
const getBrowserLanguage = () => {
    const browserLang = navigator.language.split("-")[0]; // Get primary language code
    return ["en", "ar"].includes(browserLang) ? browserLang : "en"; // Default to 'en' if not supported
};

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: enTranslations },
        ar: { translation: arTranslations },
    },
    lng: getBrowserLanguage(),
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

// Update document direction based on language
document.documentElement.dir = getBrowserLanguage() === "ar" ? "rtl" : "ltr";
document.documentElement.lang = getBrowserLanguage();

export default i18n;
