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
    AtSign,
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
    const user = useSelector((state) => state.auth.user);
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";

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
        <div className="sticky top-0 bg-white z-10 p-3.5 md:4.5 lg:p-6 border-b border-gray-300 rounded-t-lg">
            {/* Top Actions Bar */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={onGoBack}
                    className="p-2 rounded-lg hover:bg-gray-300 transition-all duration-100"
                >
                    <ArrowRight
                        className={`
              w-5 h-5 text-gray-600
              ${isRTL ? "" : "rotate-180"}
            `}
                    />
                </button>

                <div className="flex items-center gap-1 md:gap-3 lg:gap-4">
                    <button
                        onClick={onReply}
                        className="flex items-center gap-2 p-2 text-blue-600 
              hover:bg-blue-100 rounded-lg transition-all duration-100
              text-sm font-medium"
                    >
                        <Reply className="w-5 h-5" />
                        <span className="hidden sm:inline">{t("email.Reply")}</span>
                    </button>

                    <button
                        onClick={onForward}
                        className="flex items-center gap-2 p-2 text-emerald-600
              hover:bg-emerald-100 rounded-lg transition-all duration-100
              text-sm font-medium"
                    >
                        <ForwardIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">{t("email.Forward")}</span>
                    </button>

                    <button
                        onClick={() => onArchive(email.id)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
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
                        className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                        title={isStarred ? t("starred.unstar") : t("starred.star")}
                    >
                        <Star
                            className={`w-5 h-5 ${isStarred ? "text-yellow-400 fill-yellow-400" : "text-yellow-400"
                                }`}
                        />
                    </button>

                    <button
                        onClick={() => onDelete(email.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title={t("common.delete")}
                    >
                        <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                </div>
            </div>

            {/* Email Info Section */}
            <div className="space-y-3">
                <div className="ms-6 md:ms-[75px] lg:ms-[75px]">
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                        {email.subject}
                    </h1>
                </div>

                <div className="flex items-start">
                    {/* Sender Avatar */}
                    <EmailAvatar
                        picture={email.senderPictureURL}
                        alt={email.sender}
                        isSent={email.senderEmail === user.email}
                    />

                    {/* Sender Info & Time */}
                    <div className="flex-grow min-w-0">
                        <div className="flex items-end justify-between">
                            <div className="flex-grow">
                                <div className="font-semibold text-gray-900 flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <h2 className="">
                                        {email.sender === user.name ? `${t("email.me")}` : email.sender}
                                    </h2>
                                </div>

                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <AtSign className="w-4 h-4 text-gray-500" />
                                    <span> {email.senderEmail} </span>
                                </div>

                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <Send className="w-4 h-4 text-gray-500" />
                                    <span>
                                        {email.receiverEmail === user.email ? `${t("email.to")} ${t("email.me")}` : `${t("email.to")} ${email.receiverEmail}`}
                                    </span>
                                </div>
                            </div>

                            <div className="flex text-gray-500 text-sm">
                                {formatDateTime(email.date)}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailHeader;
