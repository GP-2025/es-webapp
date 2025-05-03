// Main SideNavbar.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, toggleSidebar } from "../../store/slices/authSlice";
import ComposeModal from "../ComposeModal";
import ComposeButton from "./ComposeButton";
import FooterSection from "./FooterSection";
import NavigationItems from "./NavigationItems";
import UserProfile from "./UserProfile";

const SideNavbar = ({ children }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isOpen = useSelector((state) => state.auth.sidebarOpen);

  const [settingsOpen, setsettingsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [compose, setcompose] = useState(false);

  const handleToggleSidebar = (value) => {
    dispatch(toggleSidebar(value));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 w-full ">
      <div
        className={`h-full transition-all duration-200 ${
          isOpen ? "w-48" : "w-16"
        } flex-0.4`}
      >
        <UserProfile
          user={user}
          isOpen={isOpen}
          handleToggleSidebar={handleToggleSidebar}
          setsettingsOpen={setsettingsOpen}
        />

        <div className="h-fit mt-[68px]">
          <ComposeButton isOpen={isOpen} setcompose={setcompose} t={t} />
          <NavigationItems isOpen={isOpen} t={t} isRTL={isRTL} />
        </div>

        <FooterSection
          isOpen={isOpen}
          handleLogout={handleLogout}
          settingsOpen={settingsOpen}
          setsettingsOpen={setsettingsOpen}
          handleToggleSidebar={handleToggleSidebar}
          setHovered={setHovered}
          hovered={hovered}
          dispatch={dispatch}
          toggleSidebar={toggleSidebar}
          t={t}
        />
      </div>

      <div
        className={`transition-all duration-200 overflow-hidden relative top-[4rem] right-0  flex-1 px-1   rounded-lg m-1 ${
          isRTL ? "pl-0" : "pr-0"
        }`}
        style={{
          maxHeight: "calc(100vh - 4rem)",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backdropFilter: "blur(300px)",
          background:
            "linear-gradient(rgba(203, 204, 206, 0.1), rgba(255, 255, 255, 0.5)) ",
        }}
      >
        {children}
      </div>

      {compose && (
        <ComposeModal
          open={compose}
          onClose={() => {
            setcompose(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default SideNavbar;
