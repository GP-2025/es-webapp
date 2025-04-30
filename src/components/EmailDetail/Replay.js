import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { sendReply, saveDraft } from "../../services/emailService";
import { errorToast, successToast } from "../../utils/toastConfig";
import { getCookie } from "../../utils/cookieUtils";

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
        //console.log("Draft saved successfully");
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
        //console.log("Final draft saved before closing");
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
    //console.log("Current state:", {
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
      className="relative w-full bg-white shadow-2xl rounded-t-xl z-50 p-4"
    >
      <div className="space-y-4">
        {/* Draft saving indicator */}
        {isSaving && (
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            {t("Draft.Saving")}
          </div>
        )}

        <textarea
          placeholder={t("Compose.MessagePlaceholder")}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="flex items-center flex-wrap gap-2">
          <input
            type="file"
            onChange={handleAttachmentChange}
            className="hidden"
            id="attachment"
            multiple
          />
          <label
            htmlFor="attachment"
            className="cursor-pointer px-4 py-2 text-gray-600 hover:bg-gray-100 rounded flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
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

          <div className="flex-1 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-50 p-1 rounded"
              >
                <span className="truncate max-w-[100px]">{file.name}</span>
                <button
                  onClick={() =>
                    setAttachments((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              {t("Compose.Cancel")}
            </button>
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
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
