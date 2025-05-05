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
        flex items-center px-4 py-2
        ${isUnread ? "bg-opacity-70 bg-blue-100 font-bold" : "bg-white"}
        hover:bg-gray-300
        border-b border-gray-300
        cursor-pointer
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
        <div className="flex sm:flex-row flex-col md:items-center lg:items-center w-full">
          <div className="flex-shrink-0">
            <EmailAvatar
              senderPictureURL={email.senderPictureURL}
              receiverPictureURL={email.receiverPictureURL}
              alt={isSent ? email.recipient : email.sender}
              isSent={isSent}
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
          />
          <div className="flex ms-auto">
            <EmailMetadata
              attachments={email.attachments}
              hasDraft={email.hasDraft}
            />

            <EmailDateTime date={email.date} />
          </div>
        </div>
      </motion.li>
    );
  }
);

EmailListItem.displayName = "EmailListItem";

export default EmailListItem;
