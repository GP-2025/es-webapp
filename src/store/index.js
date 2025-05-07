
import { configureStore } from "@reduxjs/toolkit";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./slices/authSlice";
import emailsReducer from "./slices/emailsSlice";

// Persist configuration for auth slice
const authPersistConfig = {
    key: "auth",
    version: 1,
    storage,
    whitelist: ["user", "isAuthenticated"],
};

// Create persisted reducer
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Create store
export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        emails: emailsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

// Create persistor
export const persistor = persistStore(store);
