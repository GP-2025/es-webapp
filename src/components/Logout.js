import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { removeCookie } from "../utils/cookieUtils";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        sessionStorage.clear();
        removeCookie("token");
        navigate("/login", { replace: true });
    }, [navigate]);
};

export default Logout;
