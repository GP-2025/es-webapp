import { motion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { saveDraft, sendReply } from "../../services/emailService";
import { getCookie } from "../../utils/cookieUtils";
import { errorToast, successToast } from "../../utils/toastConfig";
import { use } from "react";


// Custom hook to manage draft content and API calls
const useDraftManager = (initialContent = "", conversationId, onClose) => {
    const [content, setContent] = useState(initialContent);
    const [isSaving, setIsSaving] = useState(false);
    const [shouldSave, setShouldSave] = useState(false);

    // Effect to handle draft saving
    useEffect(() => {
        let timeoutId;

        const saveDraftContent = async () => {
            if (!shouldSave || !content || !conversationId) return;

            try {
                setIsSaving(true);
                const formData = new FormData();
                formData.append("Id", "");
                formData.append("Content", content);
                formData.append("ParentMessageId", conversationId);
                formData.append("IsDraft", "true");

                await saveDraft(content, conversationId);
                // console.log("Draft saved successfully");
                setShouldSave(false);
            } catch (error) {
                console.error("Error saving draft:", error);
                errorToast("Failed to save draft");
            } finally {
                setIsSaving(false);
            }
        };

        if (shouldSave) {
            timeoutId = setTimeout(saveDraftContent, 1000);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [content, conversationId, shouldSave]);

    // Handle content changes
    const handleContentChange = useCallback((newContent) => {
        setContent(newContent);
        setShouldSave(true);
    }, []);

    // Handle closing with draft saving
    const handleClose = useCallback(async () => {
        if (content && conversationId) {
            try {
                setIsSaving(true);
                await saveDraft(content, conversationId);
                // console.log("Final draft saved before closing");
            } catch (error) {
                console.error("Error saving final draft:", error);
                errorToast("Failed to save draft");
            } finally {
                setIsSaving(false);
                onClose();
            }
        } else {
            onClose();
        }
    }, [content, conversationId, onClose]);

    return {
        content,
        isSaving,
        handleContentChange,
        handleClose,
    };
};

const Replay = ({
    open,
    onClose,
    email,
    draftMessage = {},
    conversationId,
}) => {
    const { t } = useTranslation();
    const { i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";
    const [attachments, setAttachments] = useState([]);

    // Initialize draft manager with proper conversation ID
    const actualConversationId = conversationId || email?.id;
    const { content, isSaving, handleContentChange, handleClose } =
        useDraftManager(draftMessage?.content, actualConversationId, onClose);

    // Initialize content when draft message changes
    useEffect(() => {
        if (draftMessage?.content) {
            handleContentChange(draftMessage.content);
        }
    }, [draftMessage, handleContentChange]);

    // Handle attachment changes
    const handleAttachmentChange = useCallback((e) => {
            const files = Array.from(e.target.files);
            const validFiles = files.filter((file) => {
                if (file.size > 5 * 1024 * 1024) {
                    errorToast(t("Compose.FileSizeError"));
                    return false;
                }

                const isDuplicate = attachments.some(
                    (existing) =>
                        existing.name === file.name && existing.size === file.size
                );
                if (isDuplicate) {
                    errorToast( (t("Compose.DuplicateFile") +" "+ file.name) );
                    return false;
                }

                return true;
            });

            setAttachments((prev) => [...prev, ...validFiles]);
            e.target.value = "";
        },
        [attachments, t]
    );

    // Handle send message
    const handleSend = async () => {
        if (!actualConversationId) {
            errorToast("Invalid conversation ID");
            return;
        }

        const token = getCookie("token");
        if (!token) {
            errorToast(t("Auth.LoginRequired"));
            return;
        }

        if (!content?.trim()) {
            errorToast(t("Compose.EmptyMessage"));
            return;
        }

        try {
            const response = await sendReply(
                content,
                actualConversationId,
                attachments,
                token
            );

            if (response.status === 200) {
                successToast(response.data.message || t("Compose.SendSuccess"));
                onClose();
            } else {
                errorToast(t("Compose.SendError"));
            }
        } catch (error) {
            console.error("Failed to send reply:", error);
            errorToast(error.message || t("Compose.SendError"));
        }
    };

    if (!open) return null;

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween" }}
            className="relative w-full bg-white border-t border-gray-300 p-6 md:pb-2 lg:pb-2"
        >
            {/* Draft saving indicator */}
            {isSaving && (
                <div className="text-sm absolute start-3 -top-8 px-2 py-1 rounded-md shadow-sm
                    border border-gray-300 bg-blue-50 text-gray-500 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    {t("Draft.Saving")}
                </div>
            )}

            <button className={`absolute end-6 -top-9 p-1 bg-red-100 rounded-md
                border border-gray-300 text-red-600
                hover:bg-red-300 transition-all duration-100`}
                onClick={handleClose} aria-label={t("Compose.close")}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                    <path d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="flex flex-col gap-4">
                <textarea
                    placeholder={t("Compose.MessagePlaceholder")}
                    value={content}
                    style={{ minHeight: "150px", maxHeight: "300px", resize: "vertical" }}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full py-2 focus:outline-none focus:border-blue-300"
                />
                
                <ul className="space-y-2">
                    {attachments.map((file, index) => (
                        <li key={index} className="flex items-center">
                            <span className="flex items-center text-sm text-gray-600 me-3">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                </svg>
                                <span className="truncate max-w-[230px] md:max-w-[400px] lg:max-w-[400px]">
                                    {file.name}
                                </span>
                            </span>
                            <button type="button" className="text-sm text-red-500"
                                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index)) }
                            >
                                {t("Compose.remove")}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="items-start">
                    <div className="flex w-full gap-4 ms-auto">
                        <input
                            type="file"
                            onChange={handleAttachmentChange}
                            className="hidden"
                            id="attachment"
                            multiple
                        />
                        <label
                            htmlFor="attachment"
                            className="me-auto cursor-pointer px-4 py-2 text-gray-600
                            bg-gray-200 hover:bg-gray-300 rounded-md flex items-center"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="hidden md:inline lg:inline ms-2 text-sm text-gray-600">{t("Compose.Attach")}</span>
                        </label>

                        <button
                            onClick={handleSend}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={!content.trim() || isSaving}
                        >
                            {t("Compose.send")}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default React.memo(Replay);
