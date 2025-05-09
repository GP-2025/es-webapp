import { motion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { saveDraft, sendReply } from "../../services/emailService";
import { getCookie } from "../../utils/cookieUtils";
import { errorToast, successToast } from "../../utils/toastConfig";

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
    const handleAttachmentChange = useCallback(
        (e) => {
            const files = Array.from(e.target.files || []);
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
                    errorToast(t("Compose.DuplicateFile", { filename: file.name }));
                    return false;
                }

                return true;
            });

            setAttachments((prev) => [...prev, ...validFiles]);
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

    // Log state for debugging
    useEffect(() => {
        // console.log("Current state:", {
        //   conversationId: actualConversationId,
        //   content,
        //   isSaving,
        // });
    }, [actualConversationId, content, isSaving]);

    if (!open) return null;

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween" }}
            className="relative w-full bg-white border-t border-gray-300 p-5 lg:p-6"
        >
            {/* Draft saving indicator */}
            {isSaving && (
                <div className="text-sm absolute -top-8 px-2 py-1 rounded-md shadow-sm bg-white text-gray-500 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    {t("Draft.Saving")}
                </div>
            )}
            
            <div className="">
                <textarea
                    placeholder={t("Compose.MessagePlaceholder")}
                    value={content}
                    style={{ minHeight: "200px", maxHeight: "400px", resize: "vertical" }}
                    onChange={(e) => handleContentChange(e.target.value)}
                    // className="w-full p-2 border border-gray-300 rounded-lg h-32 focus:outline-none focus:border-blue-300"
                    className="w-full py-2  h-32 focus:outline-none focus:border-blue-300"
                />

                <div className="mt-2 flex flex-col items-start">
                    <div className="flex flex-col gap-1 md:gap-2 lg:gap-2">
                        {attachments.map((file, index) => (
                            <div key={index} className="flex items-center text-black">
                                <span className="truncate max-w-[240px] md:max-w-[400px lg:max-w-[400px">{file.name}</span>
                                <button
                                    onClick={() =>
                                        setAttachments((prev) => prev.filter((_, i) => i !== index))
                                    }
                                    className="text-red-500 ms-2"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex w-full gap-4 mt-3 ms-auto">
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
                                className="h-5 w-5 me-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {t("Compose.Attach")}
                        </label>

                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md"
                        >
                            {t("Compose.Cancel")}
                        </button>
                        <button
                            onClick={handleSend}
                            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
