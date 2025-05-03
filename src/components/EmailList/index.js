import { motion } from "framer-motion";
import { Mail, MailOpen } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import EmailAvatar from "./EmailAvatar";
import EmailDateTime from "./EmailDateTime";
import EmailMetadata from "./EmailMetadata";
import EmailPreview from "./EmailPreview";

const EmailListItem = React.memo(
  ({ email, onSelect, isSelected, page, isSent }) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";
    const isUnread = !email.read;

    const handleClick = () => {
      onSelect(email.id);
    };

    const getLayoutClasses = () => {
      return `
        flex items-center p-3 
        ${isUnread ? "bg-blue-50 border-4 border-blue-500" : "bg-white"} 
        hover:bg-gray-50 
        rounded-xl shadow-sm 
        cursor-pointer 
        transition-colors 
        duration-150 
        ${isSelected ? "ring-2 ring-blue-500" : ""}
      `;
    };

    return (
      <motion.li
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={getLayoutClasses()}
        onClick={handleClick}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex flex-grow items-center space-x-3 sm:space-x-4 w-full">
          <div className="flex-shrink-0">
            <EmailAvatar
              picture={email.senderPicture}
              recipientPicture={email.recipientPicture}
              alt={isSent ? email.recipient : email.sender}
              isSent={isSent}
            />
          </div>

          <div className="flex-shrink-0 text-gray-500">
            {isUnread ? <Mail size={20} /> : <MailOpen size={20} />}
          </div>

          <EmailPreview
            email={email}
            isUnread={isUnread}
            page={page}
            isSent={isSent}
          />

          <EmailMetadata
            attachments={email.attachments}
            hasDraft={email.hasDraft}
          />

          <EmailDateTime date={email.date} />
        </div>
      </motion.li>
    );
  }
);

EmailListItem.displayName = "EmailListItem";

export default EmailListItem;
