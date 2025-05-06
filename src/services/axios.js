import axios from "axios";
import { errorToast } from "../utils/toastConfig";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";
import { getCookie, removeCookie } from "../utils/cookieUtils";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      removeCookie("token");
      window.location.href = "/login";
      errorToast("Session expired. Please log in again.");
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
