import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiGlobe, FiLock, FiSettings } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { setCookie } from "../../utils/cookieUtils";

function SettingsPage({
    setsettingsOpen,
    settingsOpen,
    handleToggleSidebar,
    isOpen,
}) {
    const { t, i18n } = useTranslation();
    const [language, setLanguage] = useState(i18n.language);

    const handleLanguageChange = (event, newLanguage) => {
        if (newLanguage) {
            setLanguage(newLanguage);
            i18n.changeLanguage(newLanguage);

            document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
            document.documentElement.lang = newLanguage;

            // 365 days in minutes
            const langCookieExpirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
            setCookie("language", newLanguage, langCookieExpirationDate);
        }
    };

    const [animationClass, setAnimationClass] = useState("");

    const handleOpen = () => {
        setAnimationClass("scroll-up");
        setsettingsOpen(true);
        handleToggleSidebar(true);
        document.body.style.overflow = "hidden"; // Disable scrolling
    };

    const handleClose = () => {
        setAnimationClass("scroll-down");
        setTimeout(() => {
            setsettingsOpen(false);
            setAnimationClass(""); // Reset animation class
            document.body.style.overflow = ""; // Enable scrolling
        }, 300); // Match the animation duration
    };

    if (!settingsOpen) {
        return (
            <button
                onClick={handleOpen}
                className={`flex items-center ps-5 py-1.5 pe-2 transition-all duration-200 rounded-e-xl text-gray-700 hover:bg-gray-200`}
            >
                <FiSettings className="text-xl my-1 rotating" />
                {isOpen && <span className="ms-2"> {t("general.Settings")}</span>}
            </button>
        );
    }
    return (
        <div
            className={`w-full bg-white border border-gray-200 rounded-e-lg p-3 settings-panel ${animationClass}`}
        >
            <div className="flex items-center justify-between mb-3">
                <div
                    className="flex items-center w-full cursor-pointer"
                    onClick={handleClose}
                >
                    <FiSettings className="text-2xl text-gray-600 me-3 rotating" />
                    <h2 className="text-xl font-semibold text-gray-800 w-full">
                        {t("general.Settings")}
                    </h2>
                </div>
            </div>
            <div
                className={`space-y-3 ${i18n.dir() == "rtl"}`}
            >
                <NavLink
                    to="/home/settings"
                    className={`flex items-center px-2 py-3 rounded-md transition-all duration-200 hover:bg-gray-200 text-gray-600`}
                >
                    <FiLock className="me-2 text-lg" />
                    <span className="font-medium text-sm">{t("general.ChangePassword")}</span>
                </NavLink>
                <div>
                    <label className="block text-md font-medium text-gray-700 mb-2">
                        {t("general.Language")}
                    </label>
                    <ToggleButtonGroup
                        value={language}
                        exclusive
                        onChange={handleLanguageChange}
                        aria-label="language"
                        size="medium"
                        dir="ltr"
                    >
                        <ToggleButton value="en" aria-label="English" className="" dir="ltr">
                            <FiGlobe className="me-2 text-lg" />
                            EN
                        </ToggleButton>
                        <ToggleButton value="ar" aria-label="Arabic" className="" dir="ltr">
                            <FiGlobe className="me-2 text-lg" />
                            العربية
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
