
import { ArrowRight, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MdAttachFile, MdMessage, MdSubject } from "react-icons/md";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import { toast } from "react-toastify";
import EmailLookup from "../../components/ComposeModal/EmailLookup";
import DeleteConfirmationModal from "../../components/EmailDetail/DeleteConfim";
import { deleteConversation } from "../../services/conversationsService";
import { composeEmail } from "../../services/emailService";
import getContacts from "../../services/getContactsService";
import { getCookie } from "../../utils/cookieUtils";
import { errorToast, successToast } from "../../utils/toastConfig";


const ComposeMail = ({ email, onGoBack, handleDeleteEmail }) => {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize navigate
    const [attachments, setAttachments] = useState(email.attachments || []);
    const isRTL = i18n.dir() === "rtl";
    const [Contacts, setContacts] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        type: null,
        messageId: null,
    });

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            recipients: email.recipients || "",
            subject: email.subject || "",
            body: email.body || "",
        },
    });
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const data = await getContacts();

                setContacts(data);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            }
        };
        fetchContacts();
    }, []);


    const handleDraftDelete = async () => {
        try {
            const token = getCookie("token");
            await deleteConversation(email.id, token);
            handleDeleteEmail && handleDeleteEmail(email.id);
            onGoBack && onGoBack();
        } catch (error) {
            console.error("Error deleting conversation:", error);
            toast.error("Failed to delete conversation");
        }
    };
    const handleDeleteClick = () => {
        setConfirmModal({
            open: true,
            type: "draft",
            onConfirm: handleDraftDelete,
        });
    };



    const onSubmit = async (data) => {
        try {
            const submitButton = document.getElementById("submit-button");
            submitButton.classList.add("cursor-wait");
            submitButton.disabled = true;

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

            // validate attachments
            var updated_attachments = attachments.map((attachment) => {
                if (attachment.fileURL && attachment.name && attachment.size) {
                    // return new File([attachment.fileURL], attachment.name, { type: attachment.type || "application/octet-stream" });

                    return null;
                    // return null because it is uploaded on backend server already
                }
                return attachment;
            });

            const validAttachments = updated_attachments.filter((file) => {
                return file instanceof File || file instanceof Blob;
            });

            console.log("attachments", attachments)
            console.log("updated_attachments", updated_attachments)
            console.log("validAttachments", validAttachments)

            // for each recipient, check if it exists in the map
            // compose an email for each recipient
            data.recipients.forEach(async (recipient, index) => {
                if (!map[recipient])
                    errorToast(t("Compose.recipientInvalid") + " " + recipient);

                const emailData = {
                    receiverId: map[recipient],
                    subject: data.subject,
                    content: data.body,
                    attachments: validAttachments,
                }

                // adding the id of the draft email for index zero compose
                // only: to remove the draft email from draft conversations
                if (index === 0) emailData.id = email.id;

                await composeEmail(emailData);

                successToast(t("Compose.sent") + " " + recipient);
            });

            submitButton.classList.remove("cursor-wait");
            submitButton.disabled = false;

            reset();
            setAttachments([]);
            onGoBack();

        } catch (error) {
            errorToast(error.message || t("Compose.sendFailed"));
        }
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        setAttachments((prev) => [...prev, ...files]);
        event.target.value = "";
    };

    const removeAttachment = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col bg-white rounded-t-lg">
            {/* Fixed Header */}
            <div className="sticky top-0 z-10 flex items-center border-b border-gray-300 px-4 py-3">
                <div className="flex items-center">
                    <button className="p-2 rounded-lg hover:bg-gray-300 transition-all duration-100"
                        onClick={onGoBack}
                        aria-label={t("Compose.back")}
                    >
                        <ArrowRight className={` w-5 h-5 text-gray-600 ${isRTL ? "" : "rotate-180"} `} />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900 mx-4">
                        {t("Compose.Email")}
                    </h1>
                </div>
                <div className="ms-auto flex gap-4">
                    {/* <button
                        id="submit-button"
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 text-blue-700 bg-blue-200 hover:bg-blue-300
                                rounded-lg transition-all duration-100 text-sm font-medium"
                    >
                        {t("Compose.send")}
                    </button> */}
                    <button
                        className="flex items-center gap-2 p-2 text-red-600 bg-red-100 hover:bg-red-200
                                rounded-lg transition-all duration-100 text-sm font-medium"
                        onClick={() => handleDeleteClick(email.id)}
                        title={t("email.deletePermanently")}
                    >
                        <Trash2 className="w-5 h-5" />
                        <span>{t("email.deletePermanently")}</span>
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-[200px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-white p-4 md:p-5 lg:p-6">
                        {/* Recipients Field */}
                        <EmailLookup control={control} errors={errors} />

                        {/* Subject Field */}
                        <div className="mt-5">
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
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
                                        id="subject"
                                        className={`py-2 px-3 text-sm focus:outline-none border mt-2 block w-full rounded-md shadow-sm ${errors.subject
                                            ? "border-red-300 focus:border-red-500"
                                            : "border-gray-300"
                                            } sm:text-sm transition-colors`}
                                        placeholder={t("Compose.subjectplaceholder")}
                                        dir={isRTL ? "rtl" : "ltr"}
                                    />
                                )}
                            />
                            {errors.subject && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.subject.message}
                                </p>
                            )}
                        </div>

                        {/* Email Body Field */}
                        <div className="mt-5">
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
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
                                        style={{ minHeight: "200px", maxHeight: "400px", resize: "vertical" }}
                                        {...field}
                                        id="body"
                                        className={`py-2 px-3 text-sm focus:outline-none border mt-2 block w-full rounded-md shadow-sm ${errors.body
                                            ? "border-red-300 focus:border-red-500"
                                            : "border-gray-300"
                                            } sm:text-sm transition-colors`}
                                        placeholder={t("Compose.bodyplaceholder")}
                                        dir={isRTL ? "rtl" : "ltr"}
                                    />
                                )}
                            />
                            {errors.body && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.body.message}
                                </p>
                            )}
                        </div>

                        {/* Attachments Section */}
                        <div className="mt-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <MdAttachFile className="w-5 h-5 text-gray-500" />
                                    {t("Compose.attachments")}
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center w-full px-4 py-6 bg-gray-50 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-200 cursor-pointer">
                                        <svg
                                            className="w-8 h-8 text-gray-500 mb-2"
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
                                        <span className="text-sm text-gray-600">
                                            {t("Compose.selectfile")}
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            multiple
                                            onChange={handleFileUpload}
                                        />
                                    </label>
                                </div>
                            </div>

                            {attachments.length > 0 && (
                                <ul className="mt-4 divide-y divide-gray-100">
                                    {attachments.map((file, index) => (
                                        <li key={index} className="flex items-center mb-3">
                                            <span className="flex items-center text-sm text-gray-600 me-3">
                                                <svg
                                                    className="w-4 h-4 mr-2 text-gray-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                                </svg>
                                                {
                                                    file.fileURL
                                                        ? <a className="hover:underline" target="_blank" href={`${file.fileURL}`}>{file.name}</a>
                                                        : file.name
                                                }
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="text-sm text-red-500"
                                            >
                                                {t("Compose.remove")}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="bg-white pt-4 border-t border-gray-300 flex w-full justify-end">
                            <button
                                id="submit-button"
                                type="submit"
                                className={`px-10 py-3 rounded-md font-medium text-white shadow-sm
                                bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2
                                focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                            >
                                {t("Compose.send")}
                            </button>
                        </div>
                    </div>

                    
                    {/* Fixed Footer */}
                </form>
            </div>
            <DeleteConfirmationModal
                confirmModal={confirmModal}
                setConfirmModal={setConfirmModal}
                handleDeleteClick={handleDeleteClick}
                handleDraftDelete={handleDraftDelete}
            />
        </div>
    );
};

export default ComposeMail;
