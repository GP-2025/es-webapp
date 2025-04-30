import axios from "axios";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";
import { errorToast } from "../utils/toastConfig";
import { getCookie, removeCookie, setCookie } from "../utils/cookieUtils";
import jwtDecode from "jwt-decode";

// Create axios instance for refresh token requests
const refreshAxios = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,

  timeout: 10000,
  headers: {
    accept: "text/plain",
  },
});

// Create main axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Flag to track if token refresh is in progress
let isRefreshing = false;
// Store pending requests
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Refresh token function
const refreshToken = async () => {
  try {
    const oldToken = getCookie("token");
    const response = await refreshAxios.get("/Auth/Refresh", {
      headers: {
        Authorization: `Bearer ${oldToken}`,
      },
    });
    const newToken = response.data;
    setCookie("token", newToken);
    return newToken;
  } catch (error) {
    throw error;
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
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
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is in progress, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // If refresh token fails, logout user
        store.dispatch(logout());
        removeCookie("token");
        window.location.href = "/login";
        errorToast("Session expired. Please log in again.");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other error cases
    if (error.response) {
      switch (error.response.status) {
        case 403:
          errorToast("You do not have permission to perform this action.");
          break;
        case 404:
          errorToast("The requested resource could not be found.");
          break;
        case 500:
          errorToast("An unexpected error occurred. Please try again later.");
          break;
        default:
          errorToast(error.response.data.message || "An error occurred");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
