import {
    Archive,
    ArchiveRestore,
    ArrowRight,
    Clock,
    ForwardIcon,
    Reply,
    Send,
    Star,
    Trash2,
    User
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import EmailAvatar from "./EmailAvatar";

const EmailHeader = ({
  email,
  onGoBack,
  onReply,
  onForward,
  onDelete,
  fromSearch,
  onArchive,
  isArchived,
  isStarred,
  onToggleStar,
}) => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);

  const formatDateTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // If the message is from today
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // If the message is from yesterday
    else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    // If it's from this year
    else if (messageDate.getFullYear() === today.getFullYear()) {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
    // If it's from a different year
    return messageDate.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="sticky top-[-4%] bg-white/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-gray-200 rounded-t-lg">
      {/* Top Actions Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onGoBack}
          className="p-2 rounded-full hover:bg-gray-100/80 transition-all duration-200"
        >
          <ArrowRight className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onReply}
            className="flex items-center gap-2 px-3 py-1.5 text-blue-600 
                     hover:bg-blue-50/80 rounded-full transition-all duration-200 
                     text-sm font-medium"
          >
            <Reply className="w-4 h-4" />
            <span className="hidden sm:inline">{t("email.Reply")}</span>
          </button>

          <button
            onClick={onForward}
            className="flex items-center gap-2 px-3 py-1.5 text-emerald-600 
                     hover:bg-emerald-50/80 rounded-full transition-all duration-200 
                     text-sm font-medium"
          >
            <ForwardIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{t("email.Forward")}</span>
          </button>

          <button
            onClick={() => onArchive(email.id)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={isArchived ? t("common.unarchive") : t("common.archive")}
          >
            {isArchived ? (
              <ArchiveRestore className="w-5 h-5 text-blue-600" />
            ) : (
              <Archive className="w-5 h-5 text-blue-600" />
            )}
          </button>

          <button
            onClick={() => onToggleStar(email.id)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={isStarred ? t("starred.unstar") : t("starred.star")}
          >
            <Star
              className={`w-5 h-5 ${
                isStarred ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
              }`}
            />
          </button>

          <button
            onClick={() => onDelete(email.id)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={t("common.delete")}
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>

      {/* Email Info Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-900 leading-tight">
            {email.subject}
          </h1>
        </div>

        <div className="flex items-start gap-3">
          {/* Sender Avatar */}
          <EmailAvatar
            picture={email.senderPicture}
            alt={email.sender}
            isSent={email.senderEmail === user.email}
          />

          {/* Sender Info & Time */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex-grow">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  {email.sender}
                </h2>
                <p className="text-sm text-gray-500">{email.senderEmail}</p>
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {formatDateTime(email.date)}
              </div>
            </div>

            <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
              <Send className="w-4 h-4 text-gray-500" />
              <span>
                {t("email.to")} {email.receiverEmail}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailHeader;
