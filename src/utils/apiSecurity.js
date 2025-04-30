// src/utils/apiSecurity.js
import axios from "axios";
import { errorToast } from "./toastConfig";

// Create an axios instance with interceptors
const createSecureAxios = () => {
  const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: 10000, // 10 seconds
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  // Request interceptor for adding auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle specific error scenarios
      if (error.response) {
        switch (error.response.status) {
          case 401: // Unauthorized
            errorToast("Session expired. Please log in again.");
            // Trigger logout logic
            localStorage.removeItem("authToken");
            window.location.href = "/login";
            break;
          case 403: // Forbidden
            errorToast("You do not have permission to perform this action.");
            break;
          case 404: // Not Found
            errorToast("The requested resource could not be found.");
            break;
          case 500: // Internal Server Error
            errorToast("An unexpected error occurred. Please try again later.");
            break;
          default:
            errorToast(error.response.data.message || "An error occurred");
        }
      } else if (error.request) {
        // Network error
        errorToast(
          "No response received from the server. Check your connection."
        );
      } else {
        // Other errors
        errorToast("An unexpected error occurred.");
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Input sanitization utility
export const sanitizeInput = (input) => {
  if (typeof input === "string") {
    // Remove potentially dangerous HTML and script tags
    return (
      input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, "")
        // Escape special characters
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
    );
  }
  return input;
};

// Input validation utility
export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

// Secure API methods
export const secureApi = {
  get: (url, params = {}) => {
    const secureAxios = createSecureAxios();
    return secureAxios.get(url, { params });
  },
  post: (url, data = {}) => {
    const secureAxios = createSecureAxios();
    // Sanitize input before sending
    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = sanitizeInput(data[key]);
      return acc;
    }, {});
    // //console.log(secureAxios.post(url, sanitizedData));
    return true;
  },
  put: (url, data = {}) => {
    const secureAxios = createSecureAxios();
    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = sanitizeInput(data[key]);
      return acc;
    }, {});
    return secureAxios.put(url, sanitizedData);
  },
  delete: (url) => {
    const secureAxios = createSecureAxios();
    return secureAxios.delete(url);
  },
};
