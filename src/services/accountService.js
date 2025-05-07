import axiosInstance from "./axiosConfig";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";
import { successToast } from "../utils/toastConfig";
import { removeCookie } from "../utils/cookieUtils";

export const accountService = {
    changePassword: async (passwordData) => {
        const response = await axiosInstance.post(
            "/Account/ChangePassword",
            passwordData
        );

        successToast("Password changed successfully. Please login again.");

        // Perform logout
        store.dispatch(logout());
        removeCookie("token");
        window.location.href = "/login";

        return response.data;
    },

    getProfile: async () => {
        const response = await axiosInstance.get("/Account/GetCurrentUser");
        return response.data;
    },
};
