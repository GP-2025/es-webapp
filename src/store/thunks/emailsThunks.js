import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";
import {
    fetchEmailsStart,
    fetchEmailsSuccess,
    fetchEmailsFailure,
    selectEmail,
    addEmail,
} from "../slices/emailsSlice";

// Fetch emails thunk
export const fetchEmails = createAsyncThunk(
    "emails/fetchEmails",
    async ({ page = 1, limit = 10 }, { dispatch, rejectWithValue }) => {
        try {
            dispatch(fetchEmailsStart());

            // Replace with your actual API endpoint
            const response = await axiosInstance.get(
                `/api/emails?page=${page}&limit=${limit}`
            );

            const { emails, total, totalPages } = response.data;

            dispatch(
                fetchEmailsSuccess({
                    emails,
                    page,
                    totalPages: total,
                })
            );

            return { emails, page, totalPages: total };
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to fetch emails";
            dispatch(fetchEmailsFailure(errorMessage));
            return rejectWithValue(errorMessage);
        }
    }
);

// Fetch single email details
export const fetchEmailDetails = createAsyncThunk(
    "emails/fetchEmailDetails",
    async (emailId, { dispatch, rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/api/emails/${emailId}`);

            dispatch(selectEmail(response.data));

            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to fetch email details";
            return rejectWithValue(errorMessage);
        }
    }
);

// Send email thunk
export const sendEmail = createAsyncThunk(
    "emails/sendEmail",
    async (emailData, { dispatch, rejectWithValue }) => {
        try {
            // Replace with your actual API endpoint
            const response = await axiosInstance.post("/api/emails/send", emailData);

            // Optionally add the sent email to the list
            dispatch(addEmail(response.data));

            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to send email";
            return rejectWithValue(errorMessage);
        }
    }
);
