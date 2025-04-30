// Main SideNavbar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { logout, toggleSidebar } from "../../store/slices/authSlice";
import ComposeModal from "../ComposeModal";
import UserProfile from "./UserProfile";
import ComposeButton from "./ComposeButton";
import NavigationItems from "./NavigationItems";
import FooterSection from "./FooterSection";

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

  // Hover handler for navigation section
  // const handleNavHover = () => {
  //   if (!isOpen) {
  //     setHovered(true);
  //     dispatch(toggleSidebar(true));
  //   }
  // };

  // const handleNavLeave = () => {
  //   if (hovered) {
  //     setHovered(false);
  //     dispatch(toggleSidebar(false));
  //   }
  // };

  return (
    <div className="flex h-screen bg-gray-50 w-full ">
      <div
        className={`h-full transition-all duration-300 ${
          isOpen ? "w-44 lg:w-44 sm:w-44  " : "w-12 md:w-16 sm:w-16"
        } flex-0.4`}
      >
        <UserProfile
          user={user}
          isOpen={isOpen}
          handleToggleSidebar={handleToggleSidebar}
          setsettingsOpen={setsettingsOpen}
        />

        <div
          className="mt-2 h-fit"
          // onMouseEnter={handleNavHover}
          // onMouseLeave={handleNavLeave}
        >
          <ComposeButton isOpen={isOpen} setcompose={setcompose} t={t} />
          <NavigationItems isOpen={isOpen} t={t} isRTL={isRTL} />
          {/* {isOpen && !settingsOpen && (
            <img src="/mail.png" className=" h-48 w-full  " />
          )} */}
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
        className={`transition-all duration-300 overflow-hidden relative top-[4rem] right-0  flex-1 px-1   rounded-lg m-1 ${
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
