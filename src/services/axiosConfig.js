import axios from "axios";
import jwtDecode from "jwt-decode";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";
import { getCookie, removeCookie, setCookie } from "../utils/cookieUtils";
import { errorToast } from "../utils/toastConfig";

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

let isRefreshing = false;
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

// Check if token is expired
const isTokenExpired = (token) => {
	if (!token) return true;
	try {
		const decodedToken = jwtDecode(token);
		const currentTime = Date.now() / 1000;
		return decodedToken.exp < currentTime;
	} catch (error) {
		return true;
	}
};

// Refresh token function
const refreshToken = async () => {
	try {
		const oldToken = getCookie("token");
		const userData = localStorage.getItem('user');
		if (userData) {
			const user = JSON.parse(userData);
		}
		const response = await refreshAxios.get("/Auth/Refresh", {
			headers: {
				accept: "text/plain",
				Authorization: `Bearer ${oldToken}`,
				"Content-Type": "application/json",
				"X-Requested-With": "XMLHttpRequest",
			},
		});

		// Check if response contains the new token
		if (!response.data) {
			throw new Error("No token received from refresh endpoint");
		}

		const newToken = response.data;
		setCookie("token", newToken);
		return newToken;

	} catch (error) {
		console.error("Refresh Token Error:", error);
		if (error.response?.status === 404) {
			console.error(
				"Refresh endpoint not found. Please check the API URL and path"
			);
		}
		throw error;
	}
};

// Request interceptor
axiosInstance.interceptors.request.use(
	async (config) => {
		const token = getCookie("token");

		// Check if token exists and is expired
		if (token && isTokenExpired(token)) {
			if (!isRefreshing) {
				isRefreshing = true;
				try {
					const newToken = await refreshToken();
					config.headers["Authorization"] = `Bearer ${newToken}`;
				} catch (error) {
					// If refresh fails, logout user
					store.dispatch(logout());
					removeCookie("token");
					window.location.href = "/login";
					errorToast("Session expired. Please log in again.");
					return Promise.reject(error);
				} finally {
					isRefreshing = false;
				}
			} else {
				// Wait for the refresh to complete
				return new Promise((resolve) => {
					failedQueue.push((token) => {
						config.headers["Authorization"] = `Bearer ${token}`;
						resolve(config);
					});
				});
			}
		} else if (token) {
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

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
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
				store.dispatch(logout());
				removeCookie("token");
				window.location.href = "/login";
				errorToast("Session expired. Please log in again.");
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

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
