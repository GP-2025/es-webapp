import axios from "axios";
import CryptoJS from 'crypto-js';
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

// is token cookie expired
const isAccessTokenExpired = (token) => {
	if (!token) return true;
	try {
		const decodedToken = jwtDecode(token);
		const currentTime = Date.now() / 1000;
		console.log("Minutes until token expires:", Math.floor((decodedToken.exp - currentTime)/60/60));
		
		// 5 minutes before the token expires
		return currentTime > (decodedToken.exp - 60 * 5);
	} catch (error) {
		return true;
	}
};

// refresh token from login endpoint function
const refreshToken = async () => {
	const IDU = JSON.parse(sessionStorage.getItem('IDU'));
	const response = await fetch(process.env.REACT_APP_API_BASE_URL + "/Auth/Login", {
		method: "POST",
		headers: {
			accept: "text/plain",
			"Content-Type": "application/json",
			"X-Requested-With": "XMLHttpRequest",
		},
		body: JSON.stringify({
			email: CryptoJS.AES.decrypt(IDU.IDE, secretKey).toString(CryptoJS.enc.Utf8),
			password: CryptoJS.AES.decrypt(IDU.IDP, secretKey).toString(CryptoJS.enc.Utf8),
		})
	});
	const data = await response.json();
	if (response.ok) {
		const token = data.accessToken;
		console.log("token refreshed from login endpoint:", token);
		setCookie("token", token);
		return token;
	}
};

// Request interceptor
axiosInstance.interceptors.request.use(
	async (config) => {
		// same the normal isTokenExpired but for checks for the expire time
		// of he access token 60 seconds before its actually expires
		if (window.location.pathname != "/login")
			if (isAccessTokenExpired(getCookie("token")))
				await refreshToken();

		// refresh token as soon as the page is loaded
		// if the page is not the login page
		// if (window.location.pathname != "/login")
		// 	await refreshToken();

		// get the token from the cookie
		const token = getCookie("token");

		// Check if token exists and is expired
		if (token && isTokenExpired(token)) {
			if (!isRefreshing) {
				isRefreshing = true;
				try {
					// trying to refresh the token
					console.log("(token is expired) refreshing token...");
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

// encryption key
export const secretKey = process.env.REACT_APP_SECRET_KEY
export default axiosInstance;
