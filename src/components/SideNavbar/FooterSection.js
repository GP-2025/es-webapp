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
    <div
      className={`absolute bottom-0 ${
        isOpen ? "w-[167px]" : "w-16 pe-2"
      }`}
    >
      <div className="flex flex-col space-y-1">
        <SettingsPage
          handleToggleSidebar={handleToggleSidebar}
          isOpen={isOpen}
          setsettingsOpen={setsettingsOpen}
          settingsOpen={settingsOpen}
        />
        <button
          onClick={handleLogout}
          className="flex items-center rounded-e-xl ps-5 py-1.5 text-red-600 hover:bg-red-200 transition-colors"
        >
          <FiLogOut className="text-xl my-1" />
          {isOpen && <span className="ms-3">{t("general.Logout")}</span>}
        </button>
      </div>
    </div>
  );
};
export default FooterSection;
