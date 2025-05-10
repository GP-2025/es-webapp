import React from "react";
import { Paperclip } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FiFileText } from "react-icons/fi";

const EmailMetadata = ({ attachments, hasDraft }) => {
    const { t } = useTranslation();

    if (!attachments?.length && !hasDraft) return null;

    return (
        <div className="flex items-center space-x-2 mt-1 me-3">
            {hasDraft && (
                <span className="text-xs text-red-600">{<FiFileText />}</span>
            )}
            {attachments?.length > 0 && (
                <span className="text-xs text-gray-500 flex items-center">
                    <Paperclip size={14} className="inline" />
                </span>
            )}
        </div>
    );
};

export default EmailMetadata;
