import { Paperclip } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next"; // Import the hook

const EmailAttachments = ({ attachments }) => {
    const { t } = useTranslation(); // Access translation function

    return (
        attachments && (
            <div className="my-4">
                <div className="flex items-center justify-start text-gray-700 mb-1 gap-1 pt-2">
                    <h3 className="flex text-xs md:text-sm lg:text-base font-semibold justify-center items-center">
                        {attachments.length} {t("email.Attachments")}
                    </h3>
                </div>
                <ul className="space-y-2">
                    {attachments.map((attachment, index) => (
                        <li className="flex items-center justify-between px-2 py-1 text-xs rounded-lg
                            md:text-sm lg:text-base bg-gray-200 hover:underline hover:bg-gray-300 w-fit"
                        >
                            <a key={index} target="_blank" href={attachment.url || attachment.fileURL}>
                                <span className="w-full text-center sm:text-left truncate">{attachment.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )
    );
};

export default EmailAttachments;
