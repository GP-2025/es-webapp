// src/utils/authGuard.js
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import SideNavbar from "../components/SideNavbar/SideNavbar";
// import SearchInput from "../components/Search";
import { getCookie } from "../utils/cookieUtils";

const AuthGuard = ({ fristtime = false }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const location = useLocation();
    const token = getCookie("token");

    // Allow access to firsttimelogin without a token
    if (window.location.pathname === "/login/firsttime" && token.length > 0) {
        return window.location.href = "/"
        // <Outlet />;
    }

    if (!isAuthenticated || !token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (isAuthenticated || token) {
        return (
            <>
                <div className="flex h-screen">
                    <SideNavbar>
                        {/* <SearchInput /> */}
                        <Outlet />
                    </SideNavbar>
                </div>
            </>
        );
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default AuthGuard;
