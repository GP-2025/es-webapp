// components/SideNavbar/NavFooter.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { FiLogOut } from "react-icons/fi";
import { toggleSidebar } from "../../store/slices/authSlice";
import { logout } from "../../store/slices/authSlice";
import SettingsPage from "../../pages/SettingsPage";

const NavFooter = ({ isOpen }) => {
  const handleToggleSidebar = (value) => {
    dispatch(toggleSidebar(value));
  };
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleMouseInteraction = (enter) => {
    if (!isOpen) {
      setHovered(enter);
      dispatch(toggleSidebar(enter));
    }
  };

  return (
    <div className="absolute bottom-0 w-full border-t border-gray-200">
      <SettingsPage
        handleToggleSidebar={handleToggleSidebar}
        isOpen={isOpen}
        setsettingsOpen={setSettingsOpen}
        settingsOpen={settingsOpen}
      />

      <button
        onMouseEnter={() => handleMouseInteraction(true)}
        onMouseLeave={() => handleMouseInteraction(false)}
        onClick={handleLogout}
        className="w-full flex items-center p-4 text-red-600 hover:bg-red-200 transition-colors"
      >
        <FiLogOut className="text-xl" />
        {isOpen && <span className="ml-3">{t("general.Logout")}</span>}
      </button>
    </div>
  );
};

export default NavFooter;
