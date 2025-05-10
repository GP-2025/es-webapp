import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getCookie } from "./utils/cookieUtils";

import arTranslations from "./locales/ar.json";
import enTranslations from "./locales/en.json";

const getInitialLanguage = () => {
    const cookieLang = getCookie("language");
    if (cookieLang && ["en", "ar"].includes(cookieLang)) return cookieLang;

    const browserLang = navigator.language.split("-")[0];
    return ["en", "ar"].includes(browserLang) ? browserLang : "en";
};

const initialLang = getInitialLanguage();

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: enTranslations },
        ar: { translation: arTranslations },
    },
    lng: initialLang,
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

document.documentElement.dir = initialLang === "ar" ? "rtl" : "ltr";
document.documentElement.lang = initialLang;

export default i18n;
