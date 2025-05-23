import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./i18n"; // Import i18n configuration

import AuthGuard from "./utils/authGuard";
import SignalRConnection from "./services/signalRService";

import LoginPage from "./pages/LoginPage";
import Logout from "./components/Logout";

import InboxPage from "./pages/InboxPage";
import SentPage from "./pages/SentPage";
import TrashPage from "./pages/TrashPage";
import ArchivedPage from "./pages/ArchivedPage";
import DraftPage from "./pages/DraftPage";
import StarredPage from "./pages/StarredPage";
import SearchPage from "./pages/SearchPage";
import SearchListPage from "./pages/SearchListPage";
import ChangePassword from "./pages/ChangePassword";


function App() {
    const { messages } = SignalRConnection();
    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* Authenticated Routes */}
                    <Route path="/*" element={<LoginPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/logout" element={<Logout />} />
                    
                    {/* Public Routes */}
                    <Route path="/home/*" element={<AuthGuard />}>
                        <Route path="inbox" element={<InboxPage messages={messages} />} />
                        <Route path="drafts" element={<DraftPage messages={messages} />} />
                        <Route path="starred" element={<StarredPage messages={messages} />} />
                        <Route path="archived" element={<ArchivedPage messages={messages} />} />
                        <Route path="trash" element={<TrashPage messages={messages} />} />
                        <Route path="sent" element={<SentPage messages={messages} />} />
                        <Route path="search" element={<SearchPage messages={messages} />} />
                        <Route path="searchList" element={<SearchListPage messages={messages} />} />
                        <Route path="settings" element={<ChangePassword isFirstTime={false} />} />
                        <Route path="*" element={<InboxPage messages={messages} />} />
                    </Route>
                </Routes>
            </BrowserRouter>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    );
}

export default App;
