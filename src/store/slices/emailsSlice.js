// src/store/slices/emailsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const emailsSlice = createSlice({
    name: "emails",
    initialState: {
        emailList: [],
        currentEmail: null,
        isLoading: false,
        error: null,
        page: 1,
        totalPages: 0,
    },
    reducers: {
        fetchEmailsStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        fetchEmailsSuccess: (state, action) => {
            state.isLoading = false;
            state.emailList = action.payload.emails;
            state.page = action.payload.page;
            state.totalPages = action.payload.totalPages;
            state.error = null;
        },
        fetchEmailsFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        selectEmail: (state, action) => {
            state.currentEmail = action.payload;
        },
        clearCurrentEmail: (state) => {
            state.currentEmail = null;
        },
        addEmail: (state, action) => {
            state.emailList.unshift(action.payload);
        },
        removeEmail: (state, action) => {
            state.emailList = state.emailList.filter(
                (email) => email.id !== action.payload
            );
        },
    },
});

export const {
    fetchEmailsStart,
    fetchEmailsSuccess,
    fetchEmailsFailure,
    selectEmail,
    clearCurrentEmail,
    addEmail,
    removeEmail,
} = emailsSlice.actions;

export default emailsSlice.reducer;
