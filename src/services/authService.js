import axiosInstance from "./axiosConfig";
import { store } from "../store";
import { loginSuccess } from "../store/slices/authSlice";
import { successToast } from "../utils/toastConfig";
import { setCookie, removeCookie } from "../utils/cookieUtils";

export const authService = {
    login: async (credentials) => {
        const response = await axiosInstance.post("/Auth/LogIn", credentials);
        const userData = response.data;

        setCookie("token", userData.accessToken, 15);

        store.dispatch(
            loginSuccess({
                userId: userData.userId,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                pictureURL: userData.pictureURL,
                signatureURL: userData.signatureURL,
                departmentName: userData.departmentName,
                collegeName: userData.collegeName,
                nationalId: userData.nationalId,
                IdP: btoa(credentials.password),
            })
        );

        successToast(`Welcome back, ${userData.name}!`);
        return userData;
    },

    logout: () => {
        removeCookie("token");
    },
};
