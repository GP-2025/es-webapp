import { store } from "../store";
import { loginSuccess } from "../store/slices/authSlice";
import { removeCookie, setCookie } from "../utils/cookieUtils";
import { successToast } from "../utils/toastConfig";
import axiosInstance, { secretKey } from "./axiosConfig";
import CryptoJS from 'crypto-js';

export const authService = {
    login: async (credentials) => {
        const response = await axiosInstance.post("/Auth/LogIn", credentials);
        const userData = response.data;

        setCookie("token", userData.accessToken);

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
            })
        );

        // saving the email and password in local storage, to be used in the axios interceptor
        localStorage.setItem('IDU', JSON.stringify({
            IDE: CryptoJS.AES.encrypt(userData.email, secretKey).toString(),
            IDP: CryptoJS.AES.encrypt(credentials.password, secretKey).toString(),
        }));

        successToast(`Welcome back, ${userData.name}!`);
        return userData;
    },

    logout: () => {
        removeCookie("token");
    },
};
