import { ArrowLeft, Paperclip } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import EmailLookup from "../../components/ComposeModal/EmailLookup";
import { composeEmail } from "../../services/emailService";
import getContacts from "../../services/getContactsService";
import { errorToast, successToast } from "../../utils/toastConfig";

const ComposeMail = ({ email, onGoBack }) => {
    // console.log(email);
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize navigate
    const [attachments, setAttachments] = useState(email.attachments || []);
    const isRTL = i18n.dir() === "rtl";
    const [Contacts, setContacts] = useState(false);

    // console.log(email);
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
                // console.log(data);

                setContacts(data);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            }
        };
        fetchContacts();
    }, []);
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

            const emailData = {
                id: email.id,
                subject: data.subject,
                receiverId: map[data.recipients[0]],
                content: data.body,
                attachments: validAttachments,
            };

            const response = await composeEmail(emailData);
            if (response) {
                successToast(t("Compose.saved"));
                reset();
                setAttachments([]);
                onGoBack(); // Refresh the page
            } else {
                throw new Error(t("Compose.sendFailed"));
            }
        } catch (error) {
            errorToast(error.message || t("Compose.sendFailed"));
        }
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        setAttachments((prev) => [...prev, ...files]);
    };

    const removeAttachment = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50">
            {/* Fixed Header */}
            <div className="bg-white border-b px-4 py-2 flex items-center sticky top-0 z-10">
                <button
                    onClick={onGoBack}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label={t("Compose.back")}
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 mx-4">
                    {t("Compose.Email")}
                </h1>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div className="bg-white shadow-sm rounded-xl p-4">
                        {/* Recipients Field */}

                        <EmailLookup control={control} errors={errors} />

                        {/* Subject Field */}
                        <div className="mt-3">
                            <label
                                htmlFor="subject"
                                className="block text-sm font-medium text-gray-700"
                            >
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
                                        className={`mt-1 block w-full rounded-md shadow-sm ${errors.subject
                                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                        <div className="mt-3">
                            <label
                                htmlFor="body"
                                className="block text-sm font-medium text-gray-700"
                            >
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
                                        id="body"
                                        rows={8}
                                        className={`mt-1 block w-full rounded-md shadow-sm ${errors.body
                                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                        <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700">
                                {t("Compose.attachments")}
                            </label>
                            {
                                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>{t("Compose.selectfile")}</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="sr-only"
                                                    onChange={handleFileUpload}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            }

                            {attachments.length > 0 && (
                                <ul className="mt-4 divide-y divide-gray-200">
                                    {attachments.map((file, index) => (
                                        <li
                                            key={index}
                                            className="py-3 flex justify-between items-center"
                                        >
                                            <span className="text-sm text-gray-700">{file.name}</span>
                                            {
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(index)}
                                                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                                                >
                                                    {t("Compose.remove")}
                                                </button>
                                            }
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="bg-white border-t px-4 py-3 sticky bottom-0 flex justify-end space-x-3">
                        <button
                            type="submit"
                            className={`px-4 py-2 rounded-md font-medium text-white shadow-sm ${"bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"} transition-colors`}
                        >
                            {t("Compose.send")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComposeMail;
