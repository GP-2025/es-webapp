import React from "react";
import { useTranslation } from "react-i18next";
import { FiMail, FiUser, FiMessageSquare } from "react-icons/fi";

const EmailPreview = ({ email, isUnread, page, isSent }) => {
  const { t } = useTranslation();
  //console.log("EmailPreview -> email", isSent, email);
  return (
    <div className={`me-auto ms-4 ${isUnread && page !== "trash" ? "font-bold" : ""}`}>
      <div className="lg:flex md:flex-row flex-col items-center">

        <div className="me-3 lg:w-[250px]">
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

        <div className="me-3 flex items-center gap-2 font-normal">
          <p className="truncate text-sm text-gray-800 sm:text-base max-w-[200px] md:max-w-[400px]">
            {email.subject && (
              <>
                {/* Small screens - 70 chars */}
                <span className="sm:inline lg:hidden md:hidden">
                  {email.subject.length > 70 ? `${email.subject.substring(0, 70)}...` : email.subject}
                </span>
                {/* Medium screens - 100 chars */}
                <span className="hidden md:inline lg:hidden">
                  {email.subject.length > 100 ? `${email.subject.substring(0, 100)}...` : email.subject}
                </span>
                {/* Large screens - 200 chars */}
                <span className="hidden lg:inline">
                  {email.subject.length > 200 ? `${email.subject.substring(0, 250)}...` : email.subject}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="me-3 flex items-center gap-2 font-normal hidden lg:inline">
          <p className="text-sm text-gray-800 sm:text-base">-</p>
        </div>

        <div className="me-3 flex items-center font-normal">
          <p className="truncate text-xs text-gray-500 max-w-[200px] md:max-w-[400px]">
            {email.body && (
              <>
                {/* Small screens - 70 chars */}
                <span className="sm:inline lg:hidden md:hidden">
                  {email.body.length > 70 ? `${email.body.substring(0, 70)}...` : email.body}
                </span>
                {/* Medium screens - 100 chars */}
                <span className="hidden md:inline lg:hidden">
                  {email.body.length > 100 ? `${email.body.substring(0, 100)}...` : email.body}
                </span>
                {/* Large screens - 200 chars */}
                <span className="hidden lg:inline">
                  {email.body.length > 200 ? `${email.body.substring(0, 200)}...` : email.body}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;
