// FooterSection.jsx
import React from "react";
import { FiLogOut } from "react-icons/fi";
import SettingsPage from "./SettingsPage";

const FooterSection = ({
  isOpen,
  handleLogout,
  settingsOpen,
  setsettingsOpen,
  handleToggleSidebar,
  setHovered,
  hovered,
  dispatch,
  toggleSidebar,
  t,
}) => {
  return (
    <div className="absolute bottom-0 w-full border-t border-gray-200">
      <SettingsPage
        handleToggleSidebar={handleToggleSidebar}
        isOpen={isOpen}
        setsettingsOpen={setsettingsOpen}
        settingsOpen={settingsOpen}
      />
      <button
        // onMouseEnter={() => {
        //   if (!isOpen) {
        //     setHovered(true);
        //     dispatch(toggleSidebar(true));
        //   }
        // }}
        // onMouseLeave={() => {
        //   if (hovered) {
        //     setHovered(false);
        //     dispatch(toggleSidebar(false));
        //   }
        // }}
        onClick={handleLogout}
        className="w-full flex items-center pl-5 py-3 mt-2 rounded-r-lg text-red-600 hover:bg-red-200 transition-colors"
      >
        <FiLogOut className="text-xl" />
        {isOpen && <span className="ml-3">{t("general.Logout")}</span>}
      </button>
    </div>
  );
};
export default FooterSection;
