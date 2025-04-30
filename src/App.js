import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import InboxPage from "./pages/InboxPage";
import LoginPage from "./pages/LoginPage";
import AuthGuard from "./utils/authGuard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchListPage from "./pages/SearchListPage";
import SearchPage from "./pages/SearchPage";
import SentPage from "./pages/SentPage";
import TrashPage from "./pages/TrashPage";
import SignalRConnection from "./services/signalRService";

import "./i18n"; // Import i18n configuration
import ChangePassword from "./pages/ChangePassword";
import ArchivedPage from "./pages/ArchivedPage";
import StarredPage from "./pages/StarredPage";
import DraftPage from "./pages/DraftPage";
import SupportPage from "./pages/SupportPage";

function App() {
  const { status, messages } = SignalRConnection();

  console.log(messages, "app");
  return (
    <>
      <BrowserRouter>
        {status === "Connected" && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            🟢 Connected To The Server
          </div>
        )}
        {status === "Reconnecting..." && (
          <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg animate-pulse">
            🟡 Reconnecting...
          </div>
        )}
        {(status === "Disconnected" ||
          status === "Connection Failed" ||
          status === "Authentication Error") && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            🔴 {status}
          </div>
        )}
        <Routes>
          {/* Public Routes */}
          <Route path="/*" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/*" element={<AuthGuard firsttime={true} />}>
            <Route
              path="firsttime"
              element={<ChangePassword isFirstTime={true} />}
            />
          </Route>
          <Route path="/support" element={<SupportPage />} />
          {/* Authenticated Routes */}
          <Route path="/home/*" element={<AuthGuard />}>
            <Route path="inbox" element={<InboxPage messages={messages} />} />
            <Route path="drafts" element={<DraftPage messages={messages} />} />
            <Route
              path="starred"
              element={<StarredPage messages={messages} />}
            />
            <Route
              path="archived"
              element={<ArchivedPage messages={messages} />}
            />
            <Route path="trash" element={<TrashPage messages={messages} />} />
            <Route path="sent" element={<SentPage messages={messages} />} />
            <Route path="search" element={<SearchPage messages={messages} />} />
            <Route
              path="searchList"
              element={<SearchListPage messages={messages} />}
            />
            <Route
              path="settings"
              element={<ChangePassword isFirstTime={false} />}
            />
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
