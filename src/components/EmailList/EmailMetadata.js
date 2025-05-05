import React from "react";
import { Paperclip } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FiFileText } from "react-icons/fi";

const EmailMetadata = ({ attachments, hasDraft }) => {
  const { t } = useTranslation();

  if (!attachments?.length && !hasDraft) return null;

  return (
    <div className="items-center mt-1 me-3">
      {attachments?.length > 0 && (
        <span className="text-xs text-gray-500 flex items-center">
          <Paperclip size={16} className="inline" />
          {attachments.length}
        </span>
      )}
      {hasDraft && (
        <span className="text-xs text-red-600">{<FiFileText />}</span>
      )}
    </div>
  );
};

export default EmailMetadata;
