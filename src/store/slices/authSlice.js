import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    sidebarOpen: false,
    signalRConnected: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            state.error = null;
            state.signalRConnected = false; // Reset connection status on login
        },
        loginFailure: (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = action.payload;
            state.signalRConnected = false;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
            state.signalRConnected = false;
        },
        toggleSidebar: (state, action) => {
            state.sidebarOpen = action.payload;
        },
        setSignalRConnected: (state, action) => {
            state.signalRConnected = action.payload;
        },
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    toggleSidebar,
    setSignalRConnected,
} = authSlice.actions;

export default authSlice.reducer;
