import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const EmailPreview = ({ email, isUnread, page, isSent, isArchived, isTrash }) => {
    const { t } = useTranslation();
    const user = useSelector((state) => state.auth.user);

    return (
        <div className={`me-auto ${isUnread && page !== "trash" ? "font-bold" : ""}`}>
            <div className="lg:flex md:flex-row flex-col items-center">

                <div className="me-6">
                    <p className={`text-sm text-gray-800 truncate md:w-[100px] lg:w-[150px] ${isUnread ? "font-bold" : "font-normal"}`}>
                        {/* {isSent ?
                            <>
                                {t("email.to")} {email.receiver}
                            </>
                            : (
                                <>
                                    {isArchived || isTrash ? t("email.From") : ""} {email.sender}
                                </>
                            )} */}
                            {email.senderEmail === user.email ? email.receiver : email.sender}
                    </p>
                </div>

                <div className="me-3 flex items-center gap-2 font-normal">
                    <p className={`truncate text-sm text-gray-800 sm:text-base max-w-[230px] md:max-w-[300px] lg:max-w-[400px] ${isUnread ? "font-bold" : "font-normal"}`}>
                        {email.subject}
                    </p>
                </div>

                <div className="me-3 items-center gap-2 font-normal hidden lg:inline">
                    <p className="text-sm text-gray-800 sm:text-base">-</p>
                </div>

                <div className="me-3 flex items-center font-normal">
                    <p className="truncate text-xs text-gray-500 max-w-[230px] md:max-w-[300px] lg:max-w-[300px]">
                        {email.body}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailPreview;
