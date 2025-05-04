import React from "react";
import { useTranslation } from "react-i18next";
import { FiMail, FiUser, FiMessageSquare } from "react-icons/fi";

const EmailPreview = ({ email, isUnread, page, isSent }) => {
  const { t } = useTranslation();
  //console.log("EmailPreview -> email", isSent, email);
  return (
    <div className={`me-auto ms-4 ${isUnread && page !== "trash" ? "font-bold" : ""}`}>
      <div className="flex items-center space-x-3">

        <div className="me-3">
          <p className="text-sm text-gray-800 truncate font-normal">
            {isSent ?
              <>
                {t("email.to")} {email.receiver}
              </>
              : (
                <>
                  {email.sender}
                </>
              )}
          </p>
        </div>

        <div className="flex items-center gap-2 font-normal">
          <p className="truncate text-sm text-gray-800 sm:text-base">{email.subject}</p>
        </div>

        <div className="flex items-center gap-2 font-normal">
          <p className="truncate text-sm text-gray-800 sm:text-base">-</p>
        </div>

        <div className="flex items-center ms-4 font-normal">
          <p className="truncate text-xs text-gray-500">{email.body}</p>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;
