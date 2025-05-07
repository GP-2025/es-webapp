// src/store/thunks/authThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginStart, loginSuccess, loginFailure } from "../slices/authSlice";
import { authService } from "../../services/authService";
import { errorToast, successToast } from "../../utils/toastConfig";

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (credentials, { dispatch }) => {
        try {
            dispatch(loginStart());
            const response = await authService.login(credentials);
            dispatch(loginSuccess(response));
            successToast("Login successful");
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed";
            dispatch(loginFailure(errorMessage));
            errorToast(errorMessage);
            throw error;
        }
    }
);
