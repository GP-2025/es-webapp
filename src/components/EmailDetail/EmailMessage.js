import { motion } from "framer-motion";
import {
    AtSign,
    Clock,
    MessageSquare,
    Trash2,
    User
} from "lucide-react";
import React from "react";
import EmailAttachments from "./Attachments";
import EmailBody from "./Body";
import DeleteMenu from "./DeleteMenu";

import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const EmailMessage = ({ message, menuOpen, setMenuOpen, setConfirmModal }) => {
  const user = useSelector((state) => state.auth.user);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return `Today, ${messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;
    }
    return messageDate.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="mb-6 last:mb-0 bg-white rounded-b-xl">
      <div className="p-4 md:p-6">
        {/* Header Section */}
        <div className="flex flex-row sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 me-3">
              {message.senderPictureURL ? (
                <img
                  src={message.senderPictureURL}
                  alt={message.sender}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">
                    {message.sender?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                {message.sender === user.name ? `${t("email.me")}` : message.sender}
              </h3>
              <p className="text-sm text-gray-500 truncate flex items-center gap-2">
                <AtSign className="w-4 h-4 text-gray-500" />
                {message.senderEmail}
                </p>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center justify-center flex-nowrap">
              <time>{formatDate(message.date)}</time>
            </div>

            <div className="relative">
              <button
                onClick={() =>
                  setMenuOpen(menuOpen === message.id ? null : message.id)
                }
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Delete options"
              >
                <Trash2 className="w-5 h-5 text-red-500 hover:text-red-600" />
              </button>

              {menuOpen === message.id && (
                <DeleteMenu
                  messageId={message.id}
                  setConfirmModal={setConfirmModal}
                  setMenuOpen={setMenuOpen}
                />
              )}
            </div>
          </div>
        </div>

        {/* Message Body */}
        <div className="prose prose-sm max-w-none">
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">Message</span>
          </div>
          <EmailBody body={message.body} />
        </div>

        {/* Attachments */}
        {message?.attachments?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <EmailAttachments attachments={message.attachments} />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(EmailMessage);
