import React from "react";
import { useTranslation } from "react-i18next"; // Import the hook

const RecipientsDisplay = ({ recipients }) => {
  const { t } = useTranslation(); // Access translation function

  return (
    <div className="w-full">
      <label
        htmlFor="recipients"
        className="block text-sm font-semibold text-gray-700 mb-3"
      >
        {t("Compose.Recipients")}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {recipients &&
          recipients.map((recipient, index) => (
            <div
              key={index}
              className="bg-gray-100 border border-gray-200 rounded-lg p-3 shadow-sm hover:bg-gray-50 transition-all duration-200"
            >
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {recipient[0]}
                </span>
                <span className="text-xs text-gray-600 truncate">
                  {recipient[1]}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RecipientsDisplay;
