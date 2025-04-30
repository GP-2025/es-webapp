// src/utils/toastConfig.js
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Custom toast configurations
export const successToast = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    className: "bg-green-500 text-white",
  });
};

export const errorToast = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    className: "bg-red-500 text-white",
  });
};

export const infoToast = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    className: "bg-blue-500 text-white",
  });
};

export const warningToast = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    className: "bg-yellow-500 text-white",
  });
};
