import { motion } from "framer-motion";
import { Mail, MailOpen } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import EmailAvatar from "./EmailAvatar";
import EmailDateTime from "./EmailDateTime";
import EmailMetadata from "./EmailMetadata";
import EmailPreview from "./EmailPreview";
import { useSelector } from "react-redux";

const EmailListItem = React.memo(
    ({ email, onSelect, isSelected, page, isSent, isArchived, isTrash }) => {
        const { i18n } = useTranslation();
        const isRTL = i18n.dir() === "rtl";
        var isUnread = !email.read;

        const handleClick = () => {
            onSelect(email.id);
        };

        // current logged in user data
        const user = useSelector((state) => state.auth.user);

        // conversation data
        const senderEmail = email.senderEmail
        const receiverEmail = email.receiverEmail
        const lastMessageSenderId = email.lastMessageSenderId

        // making sure that the only the Is Read Feature works
        // only on the receiver side not the sender side.
        if (senderEmail == user.email) isUnread = false
        if (lastMessageSenderId == user.userId) isUnread = false

        const getLayoutClasses = () => {
            return `
                flex items-center px-4 py-2
                ${isUnread ? "bg-blue-100 font-bold" : "bg-white"}
                hover:bg-gray-300
                border-b border-gray-300
                cursor-pointer
            `;
        };

        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1 }}
                className={getLayoutClasses()}
                onClick={handleClick}
                dir={isRTL ? "rtl" : "ltr"}
            >
                <div className="flex sm:flex-row flex-col md:items-center lg:items-center w-full">
                    <div className={`me-4 flex-shrink-0 ${isArchived || isTrash ? 'hidden' : ''}`}>
                        <EmailAvatar
                            pictureURL={email.senderEmail === user.email ? email.receiverPictureURL : email.senderPictureURL}
                            alt={email.senderEmail === user.email ? email.receiver : email.sender}
                        />
                    </div>

                    <div className="hidden lg:flex flex-shrink-0 text-gray-500 me-4">
                        {isUnread ? <Mail size={20} /> : <MailOpen size={20} />}
                    </div>

                    <EmailPreview
                        email={email}
                        isUnread={isUnread}
                        page={page}
                        isSent={isSent}
                        isArchived={isArchived}
                        isTrash={isTrash}
                    />

                    <div className="flex ms-auto">
                        <EmailMetadata attachments={email.attachments} hasDraft={email.hasDraft} />
                        <EmailDateTime date={email.date} />
                    </div>

                </div>
            </motion.div>
        );
    }
);

EmailListItem.displayName = "EmailListItem";

export default EmailListItem;
