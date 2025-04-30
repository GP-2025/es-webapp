import React from "react";
import { useTranslation } from "react-i18next";
import { FiMail, FiUser, FiMessageSquare } from "react-icons/fi";

const EmailPreview = ({ email, isUnread, page, isSent }) => {
  const { t } = useTranslation();
  //console.log("EmailPreview -> email", isSent, email);
  return (
    <div className="flex-grow min-w-0">
      <div className="flex items-center gap-2">
        <FiMail
          className={`${
            isUnread && page !== "trash" ? "text-blue-700" : "text-gray-800"
          } w-4 h-4`}
        />
        <h3
          className={`
            font-semibold 
            truncate
            ${isUnread && page !== "trash" ? "text-blue-700" : "text-gray-800"}
            text-sm 
            sm:text-base
          `}
        >
          {email.subject}
        </h3>
      </div>

      <div className="flex items-center space-x-2 mt-1">
        <FiUser className="text-gray-600 w-3 h-3" />
        <p className="text-xs sm:text-sm text-gray-600 truncate">
          {isSent ? (
            <>
              {t("email.to")} {email.receiver} ({email.receiverEmail})
            </>
          ) : (
            <>
              {t("email.From")} {email.sender} ({email.senderEmail})
            </>
          )}
        </p>
      </div>

      <div className="flex items-center space-x-2 mt-1">
        <FiMessageSquare className="text-gray-500 w-3 h-3" />
        <p className="text-xs text-gray-500 truncate">{email.body}</p>
      </div>
    </div>
  );
};

export default EmailPreview;
