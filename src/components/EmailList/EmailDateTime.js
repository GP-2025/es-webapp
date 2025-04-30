import React from "react";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";

const EmailDateTime = ({ date }) => {
  const { t } = useTranslation();
  const emailDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const time = emailDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const getDateDisplay = () => {
    if (emailDate.toDateString() === today.toDateString()) {
      return (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500 mb-1" />
          <div className="flex flex-col items-end">
            <span>{t("email.today")}</span>
            <span>{time}</span>
          </div>
        </div>
      );
    } else if (emailDate.toDateString() === yesterday.toDateString()) {
      return (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500 mb-1" />
          <div className="flex flex-col items-end">
            <span>{t("email.yesterday")}</span>
            <span>{time}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500 mb-1" />
          <div className="flex flex-col items-end">
            <span>{emailDate.toLocaleDateString()}</span>
            <span>{time}</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="text-xs text-gray-500 flex flex-col items-end">
      {getDateDisplay()}
    </div>
  );
};

export default EmailDateTime;
