import { AnimatePresence, motion } from "framer-motion";
import { File } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import EmailListItem from "../components/EmailList/index.js";
import ComposeMail from "../pages/ComposeMail";
import { conversationsService } from "../services/conversationsService";

const DraftPage = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";
    const user = useSelector((state) => state.auth.user);

    // State management
    const [emails, setEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentEmail, setCurrentEmail] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 25;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Fetch draft conversations
    const fetchDraftConversations = async (page) => {
        try {
            setIsLoading(true);
            const response = await conversationsService.getDraftConversations(
                page,
                pageSize
            );
            console.log(response.data)

            const transformedEmails = response.data.map((email) => ({
                id: email.id,
                subject: email.subject,
                sender: email.sender,
                senderEmail: email.senderEmail,
                recipient: email.recipient,
                recipientEmail: email.recipientEmail,
                body: email.body,
                date: new Date(
                    new Date(email.createdAt).getTime() + 2 * 60 * 60 * 1000
                ),
                read: true, // Drafts are always considered read
                attachments: email.draftAttachments || [],
                senderPictureURL: email.senderPictureURL || "Empty",
                receiverPictureURL: email.receiverPictureURL || "Empty",
            }));
            console.log("transformedEmails", transformedEmails)
            setEmails(transformedEmails);
            setTotalCount(response.count);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEmail = useCallback(
        (emailId) => {
            const updatedEmails = emails.filter((email) => email.id !== emailId);
            setEmails(updatedEmails);
            setCurrentEmail(null);
        },
        [emails]
    );

    // Update useEffect for initial load
    useEffect(() => {
        fetchDraftConversations(pageNumber);
    }, [pageNumber]);

    const handleEmailSelect = (selected) => {
        if (selected) {
            setCurrentEmail(selected);
        }
    };

    const handleClearCurrentEmail = () => {
        fetchDraftConversations(pageNumber);

        setCurrentEmail(null);
    };

    // Add pagination handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPageNumber(newPage);
        }
    };

    return (
        <div
            className={`flex flex-col`}
            dir={isRTL ? "rtl" : "ltr"}
        >
            <AnimatePresence mode="wait">
                {!currentEmail ? (
                    <motion.div
                        key="email-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-grow"
                    >
                        <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-300 rounded-t-lg">
                            <div className="select-none flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <File className="w-6 h-6 text-yellow-600" />
                                    <h1 className="text-2xl font-bold">{t("draft.draft")}</h1>
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex items-center gap-2">
                                    <span className="hidden md:block lg:block text-gray-500 text-sm py-1.5 px-4 rounded-lg border border-gray-300">
                                        {(pageNumber - 1) * pageSize + 1} - {Math.min(pageNumber * pageSize, totalCount)} {t("pagination.of")} {totalCount}
                                    </span>

                                    <button
                                        onClick={() => handlePageChange(pageNumber - 1)}
                                        disabled={pageNumber === 1 || isLoading}
                                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" viewBox="0 0 512 512" fill="currentColor">
                                            <path d={
                                                isRTL
                                                    ? "M406.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-192-192c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.7 256 169.3 425.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l192-192z"
                                                    : "M105.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l192-192c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L173.3 256l169.4 169.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-192-192z"}
                                            />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => handlePageChange(pageNumber + 1)}
                                        disabled={pageNumber === totalPages || isLoading}
                                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" viewBox="0 0 512 512" fill="currentColor">
                                            <path d={
                                                isRTL
                                                    ? "M105.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l192-192c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L173.3 256l169.4 169.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-192-192z"
                                                    : "M406.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-192-192c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.7 256 169.3 425.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l192-192z"}
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {isLoading && emails.length === 0 ? (
                            <div className="flex justify-center items-center overflow-y-auto overflow-x-auto pb-10 h-[calc(100vh-124px)]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                            </div>
                        ) : emails.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 overflow-y-auto overflow-x-auto pb-10 h-[calc(100vh-124px)]">
                                {t("draft.empty")}
                            </div>
                        ) : (
                            <div className="overflow-y-auto overflow-x-auto pb-10 h-[calc(100vh-124px)]">
                                <ul className="">
                                    {emails.map((email) => (
                                        <li key={email.id}>
                                            <EmailListItem
                                                email={email}
                                                onSelect={() => handleEmailSelect(email)}
                                                handleDeleteEmail={handleDeleteEmail}
                                                isSelected={currentEmail?.id === email.id}
                                                page="draft"
                                                isSent={email.senderEmail === user.email}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="compose-mail"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ComposeMail
                            email={currentEmail}
                            onGoBack={handleClearCurrentEmail}

                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DraftPage;
