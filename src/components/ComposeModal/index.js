import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MdAttachFile, MdMessage, MdSend, MdSubject } from "react-icons/md";
import { conversationsService } from "../../services/conversationsService";
import { composeEmail } from "../../services/emailService";
import getContacts from "../../services/getContactsService";
import {
    errorToast,
    successToast,
    warningToast,
} from "../../utils/toastConfig";
import EmailLookup from "./EmailLookup";

const ComposeModal = ({ open, onClose, initialCompose = null }) => {
  console.log(initialCompose, "intial");
  const { t, i18n } = useTranslation();
  const modalRef = useRef(null);
  const isClosingRef = useRef(false);
  const [attachments, setAttachments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [Contacts, setContacts] = useState(false);
  const isRTL = i18n.language === "ar";

  // Form initialization with the same logic
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      recipients: initialCompose?.recipients || "",
      subject: initialCompose?.subject || "",
      body: initialCompose?.body || "",
    },
  });

  const formContent = watch();

  // Memoized save Compose function to prevent multiple calls

  // Cleanup function
  const cleanup = useCallback(() => {
    reset();
    setAttachments([]);
    isClosingRef.current = false;
    setIsSaving(false);
  }, [reset]);

  // Modal close handler with proper cleanup
  const handleClose = useCallback(async () => {
    function mapEmailsToIds(contacts) {
      const emailToIdMap = {};
      contacts.forEach((contact) => {
        if (contact.email && contact.id) {
          emailToIdMap[contact.email] = contact.id;
        }
      });
      return emailToIdMap;
    }
    const map = mapEmailsToIds(Contacts);
    if (isClosingRef.current || isSaving) return;

    isClosingRef.current = true;

    if (isDirty) {
      try {
        setIsSaving(true);
        await conversationsService.composeDraft(
          formContent.subject,
          map[formContent.recipients],
          formContent.body,
          attachments.filter(
            (file) => file instanceof File || file instanceof Blob
          )
        );

        warningToast(t("Compose.draft"));
      } catch (error) {
        // If save fails, we still want to close the modal
        console.error("Error saving Compose on close:", error);
        errorToast(t("Compose.saveFailed"));
      } finally {
        setIsSaving(false);
      }
    }

    cleanup();
    onClose();
  }, [isDirty, isSaving, formContent, attachments, cleanup, onClose, t]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && open) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, handleClose]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await getContacts();
        console.log(data);

        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    fetchContacts();
  }, []);
  // Click outside handler
  const handleClickOutside = useCallback(
    (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      function mapEmailsToIds(contacts) {
        const emailToIdMap = {};
        contacts.forEach((contact) => {
          if (contact.email && contact.id) {
            emailToIdMap[contact.email] = contact.id;
          }
        });
        return emailToIdMap;
      }
      const map = mapEmailsToIds(Contacts);
      // Validate attachments
      const validAttachments = attachments.filter((file) => {
        // Add any file validation logic here if needed
        return file instanceof File || file instanceof Blob;
      });
      console.log(map[data.recipients[0]], "data");
      const emailData = {
        subject: data.subject,
        receiverId: map[data.recipients[0]], // Assuming single recipient for now
        content: data.body,
        attachments: validAttachments,
      };

      await composeEmail(emailData);
      successToast(t("Compose.saved"));
      onClose();
      reset();
      setAttachments([]);
    } catch (error) {
      errorToast(error.message || t("Compose.sendFailed"));
    }
  };

  // File handling functions
  const handleFileChange = useCallback((event) => {
    const files = Array.from(event.target.files);
    setAttachments((prev) => [...prev, ...files]);
    event.target.value = "";
  }, []);

  const removeAttachment = useCallback((index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    open && (
      <div
        className="fixed inset-0 z-50 backdrop-blur-sm bg-blue-600/60 flex justify-center items-center max-w-screen-md mx-auto rounded-xl overflow-hidden my-1"
        dir={isRTL ? "rtl" : "ltr"}
        lang={i18n.language}
        onClick={handleClickOutside}
      >
        <div
          ref={modalRef}
          className="relative w-full h-screen transform transition-all duration-200 ease-out flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 shadow-2xl border border-white/20 flex flex-col h-full">
            {/* Header - Fixed */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">
                {initialCompose ? t("Compose.edit") : t("Compose.Compose")}
              </h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label={t("Compose.close")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <form
                id="compose-form"
                onSubmit={handleSubmit(onSubmit)}
                className="p-6 space-y-4"
              >
                <EmailLookup control={control} errors={errors} />

                {/* Subject Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <MdSubject className="w-5 h-5 text-gray-500" />
                    {t("Compose.subject")}
                  </label>
                  <Controller
                    name="subject"
                    control={control}
                    rules={{
                      required: t("Compose.reqsubject"),
                      maxLength: {
                        value: 100,
                        message: t("Compose.lensubject"),
                      },
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          errors.subject
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:ring-blue-200"
                        } focus:border-blue-500 focus:ring-4 transition-all duration-200`}
                        placeholder={t("Compose.subjectplaceholder")}
                      />
                    )}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                {/* Message Body Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <MdMessage className="w-5 h-5 text-gray-500" />
                    {t("Compose.body")}
                  </label>
                  <Controller
                    name="body"
                    control={control}
                    rules={{
                      required: t("Compose.reqbody"),
                      minLength: {
                        value: 10,
                        message: t("Compose.lenbody"),
                      },
                    }}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={5}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          errors.body
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:ring-blue-200"
                        } focus:border-blue-500 focus:ring-4 transition-all duration-200`}
                        placeholder={t("Compose.bodyplaceholder")}
                      />
                    )}
                  />
                  {errors.body && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.body.message}
                    </p>
                  )}
                </div>

                {/* Attachments Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdAttachFile className="w-5 h-5 text-gray-500" />
                    {t("Compose.attachments")}
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center w-full px-4 py-6 bg-blue-50 border-2 border-blue-200 border-dashed rounded-lg hover:bg-blue-100 cursor-pointer transition-colors duration-200">
                      <svg
                        className="w-8 h-8 text-blue-500 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-sm text-blue-600">
                        {t("Compose.selectfile")}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  {/* Attachment List */}
                  {attachments.length > 0 && (
                    <ul className="mt-3 divide-y divide-gray-100">
                      {attachments.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between py-2"
                        >
                          <span className="flex items-center text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 mr-2 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                            </svg>
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-sm text-red-500 hover:text-red-700 transition-colors"
                          >
                            {t("Compose.remove")}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </form>
            </div>

            {/* Footer - Fixed */}
            <div className="px-6 py-4 bg-gradient-to-l from-blue-500 to-indigo-600 ">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  {t("Compose.Cancel")}
                </button>
                <button
                  type="submit"
                  form="compose-form"
                  className="px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  {t("Compose.send")}
                  <MdSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ComposeModal;
