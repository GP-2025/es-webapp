import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiGlobe, FiLock, FiSettings } from "react-icons/fi";
import { NavLink } from "react-router-dom";

function SettingsPage({
  setsettingsOpen,
  settingsOpen,
  handleToggleSidebar,
  isOpen,
}) {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  // Handle language change
  const handleLanguageChange = (event, newLanguage) => {
    if (newLanguage) {
      setLanguage(newLanguage);
      i18n.changeLanguage(newLanguage);

      // Update document direction based on language
      document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = newLanguage;
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
        className={`flex items-center p-4 text-gray-700 hover:bg-gray-200 transition-colors`}
      >
        <FiSettings className="text-xl rotating" />
        {isOpen && <span className="sm:ml-3"> {t("general.Settings")}</span>}
      </button>
    );
  }
  return (
    <div
      className={`w-full bg-gray-50 shadow-md rounded-lg p-3 settings-panel ${animationClass}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div
          className="flex items-center cursor-pointer w-full"
          onClick={handleClose}
        >
          <FiSettings className="text-2xl text-gray-600 mr-3 rotating" />
          <h2 className="text-xl font-semibold text-gray-800 w-full ">
            {t("general.Settings")}
          </h2>
        </div>
      </div>
      <div
        className={`space-y-6 sm:ml-10 ${i18n.dir() == "rtl" && "sm:mr-10"}`}
      >
        <NavLink
          to="/home/settings"
          className={`flex items-center p-1 sm:p-3 rounded-md transition-all duration-200 hover:bg-gray-100 text-gray-600`}
        >
          <FiLock className=" mr-1 sm:mr-3 text-lg" />
          <span className="font-medium">{t("general.ChangePassword")}</span>
        </NavLink>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("general.Language")}
          </label>
          <ToggleButtonGroup
            value={language}
            exclusive
            onChange={handleLanguageChange}
            aria-label="language"
            className="border rounded-md"
          >
            <ToggleButton value="en" aria-label="English" className="px-4 py-2">
              <FiGlobe className="mr-3 text-lg" />
              EN
            </ToggleButton>
            <ToggleButton value="ar" aria-label="Arabic" className="px-4 py-2">
              <FiGlobe className="mr-3 text-lg" />
              العربية
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
