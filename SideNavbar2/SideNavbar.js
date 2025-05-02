// components/SideNavbar/SideNavbar.js
import React from "react";
import { useSelector } from "react-redux";
import NavFooter from "./NavFooter";
import NavItems from "./NavItems";
import NavProfile from "./NavProfile";

const SideNavbar = ({ children }) => {
  const isOpen = useSelector((state) => state.auth.sidebarOpen);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      {/* Sidebar */}
      <div
        className={`h-full transition-all duration-100  
          ${isOpen ? "lg:w-72 md:w-44 sm:w-32" : "w-12 md:w-16 sm:w-16"}
          flex-0.4`}
      >
        <NavProfile isOpen={isOpen} setsettingsOpen={setSettingsOpen} />

        <NavItems isOpen={isOpen} />

        <NavFooter isOpen={isOpen} />
      </div>

      {/* Main Content */}
      <div
        className="transition-all duration-100 overflow-hidden relative top-[4rem] right-0 bg-white flex-1"
        style={{
          maxHeight: "calc(100vh - 4rem)",
        }}
      >
        <div>{children}</div>
      </div>
    </div>
  );
};

export default SideNavbar;
