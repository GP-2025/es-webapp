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
import { successToast } from "../../utils/toastConfig";

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
        navigate("/logout");
        successToast("Logged out successfully");
    };

    return (
        <div className="flex h-screen bg-gray-100 w-full">
            <div className={`h-full transition-all duration-200 ${isOpen ? "w-48" : "w-16"} flex-0.4`} >
                <UserProfile
                    user={user}
                    isOpen={isOpen}
                    handleToggleSidebar={handleToggleSidebar}
                    setsettingsOpen={setsettingsOpen}
                />

                <div className="h-fit mt-[65px]">
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
                className={`bg-white transition-all duration-200 overflow-hidden
                    border border-gray-300 rounded-xl relative top-[65px] end-0 flex-1 me-2`}
                style={{
                    maxHeight: "calc(100vh - 72px)",
                }}
            >
                {children}
            </div>

            {compose && (
                <ComposeModal
                    open={compose}
                    onClose={() => {
                        setcompose(false);
                        // window.location.reload();
                    }}
                />
            )}
        </div>
    );
};

export default SideNavbar;
