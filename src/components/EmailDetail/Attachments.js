import { Paperclip } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next"; // Import the hook

const EmailAttachments = ({ attachments }) => {
  const { t } = useTranslation(); // Access translation function

  return (
    attachments && (
      <div className="mt-4 md:mt-6 border-t pt-3 md:pt-4">
        <h3 className="font-semibold text-xs md:text-sm lg:text-base mb-2 text-center flex items-center justify-center gap-2">
          <Paperclip className="w-4 h-4" /> {t("email.Attachments")} (
          {attachments.length})
        </h3>
        <ul className="space-y-2">
          {attachments.map((attachment, index) => (
            <a
              key={index}
              target="_blank"
              href={attachment.url || attachment.fileURL}
            >
              <li
                className="bg-gray-100 rounded p-2 flex items-center justify-between 
                           text-xs md:text-sm lg:text-base flex-col sm:flex-row hover:bg-gray-200 
                           transition-colors duration-100"
              >
                <span className="w-full text-center sm:text-left truncate">
                  {attachment.name}
                </span>
              </li>
            </a>
          ))}
        </ul>
      </div>
    )
  );
};

export default EmailAttachments;
