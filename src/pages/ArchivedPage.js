import { AnimatePresence, motion } from "framer-motion";
import { Archive } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import EmailDetail from "../components/EmailDetail";
import EmailListItem from "../components/EmailList/index";
import { conversationsService } from "../services/conversationsService";

const ArchivedPage = ({ messages }) => {
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

    // Fetch conversations with pagination
    const fetchConversations = async (page) => {
        try {
            setIsLoading(true);
            const response = await conversationsService.getAllConversations(
                "Archived",
                page,
                pageSize
            );

            const transformedEmails = response.data.map((conversation) => ({
                isent: conversation.senderEmail === user.email,
                id: conversation.id,
                subject: conversation.subject,
                sender: conversation.senderName,
                senderEmail: conversation.senderEmail,
                senderPictureURL: conversation.senderPictureURLURL,
                receiver: conversation.receiverName,
                receiverEmail: conversation.receiverEmail,
                receiverPicture: conversation.receiverPictureURL,
                body: conversation.lastMessage.content,
                date: new Date(conversation.lastMessage.sentAt),
                read: conversation.lastMessage.isRead,
                attachments: conversation.lastMessage.attachements.map((att) => ({
                    name: att.name,
                    url: att.fileURL,
                    size: att.size,
                })),
            }));

            setEmails(transformedEmails);
            setTotalCount(response.count);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Update useEffect for initial load
    useEffect(() => {
        fetchConversations(pageNumber);
    }, [pageNumber]);

    // Handle real-time messages
    useEffect(() => {
        if (messages && messages.length > 0) {
            const latestMessage = messages[messages.length - 1];
            // If we receive a new message in a conversation
            if (
                latestMessage.type === "message" ||
                latestMessage.type === "received"
            ) {
                const newMessage = latestMessage.content;

                // Check if this message belongs to any existing archived conversation
                const existingEmailIndex = emails.findIndex(
                    (email) => email.id === newMessage.conversationId
                );

                if (existingEmailIndex !== -1) {
                    // Update existing conversation
                    const updatedEmails = [...emails];
                    updatedEmails[existingEmailIndex] = {
                        ...updatedEmails[existingEmailIndex],
                        body: newMessage.content,
                        date: new Date(newMessage.sentAt),
                        read: false,
                    };
                    setEmails(updatedEmails);

                    // If this conversation is currently open, update its read status
                    if (currentEmail?.id === newMessage.conversationId) {
                        updatedEmails[existingEmailIndex].read = true;
                    }
                }
            }
        }
    }, [messages]);

    const handleEmailSelect = (emailId) => {
        const selected = emails.find((email) => email.id === emailId);
        setCurrentEmail(selected);
    };

    const handleClearCurrentEmail = () => {
        setCurrentEmail(null);
    };

    const handleDeleteEmail = (emailId) => {
        const updatedEmails = emails.filter((email) => email.id !== emailId);
        setEmails(updatedEmails);
        setCurrentEmail(null);
    };
    const handleStar = async (emailId) => {
        try {
            await conversationsService.changeConversationStatus(emailId, "Starred");
            const updatedEmails = emails.filter((email) => email.id !== emailId);
            setEmails(updatedEmails);
            setCurrentEmail(null);
        } catch (error) {
            console.error("Error removing from starred:", error);
        }
    };
    const handleUnarchive = async (emailId) => {
        try {
            await conversationsService.changeConversationStatus(emailId, "Active");
            const updatedEmails = emails.filter((email) => email.id !== emailId);
            setEmails(updatedEmails);
            setCurrentEmail(null);
        } catch (error) {
            setError(error.message);
        }
    };

    // Add pagination handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPageNumber(newPage);
        }
    };

    return (
        <div
            className={`bg-white -ms-1 flex flex-col border border-gray-300 rounded-t-lg`}
            dir={isRTL ? "rtl" : "ltr"}
        >
            {error ? (
                <div className="text-red-500 text-center p-4">{error}</div>
            ) : (
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
                                        <Archive className="w-6 h-6 text-gray-600" />
                                        <h1 className="text-2xl font-bold">{t("archived.title")}</h1>
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="flex items-center gap-2">
                                        <span className="hidden md:block lg:block text-sm py-1.5 px-4 rounded-lg border border-gray-300">
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

                            <div className="overflow-y-auto overflow-x-auto pb-10 h-[calc(100vh-124px)]">
                                <ul className="">
                                    {emails.map((email) => (
                                        <li key={email.id} className="email-item">
                                            <EmailListItem
                                                page="archived"
                                                email={email}
                                                isArchived={true}
                                                isSelected={currentEmail?.id === email.id}
                                                onSelect={handleEmailSelect}
                                                onArchive={handleUnarchive}
                                                isSent={email.senderEmail === user.email}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ) : (
                        <EmailDetail
                            key="email-detail"
                            email={currentEmail}
                            onGoBack={handleClearCurrentEmail}
                            onDelete={handleDeleteEmail}
                            onArchive={handleUnarchive}
                            onToggleStar={handleStar}
                            isArchived={true}
                            messages={messages}
                        />
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

export default ArchivedPage;
