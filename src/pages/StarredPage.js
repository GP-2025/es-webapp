import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { conversationsService } from "../services/conversationsService";

import { useSelector } from "react-redux";
import EmailDetail from "../components/EmailDetail";
import EmailListItem from "../components/EmailList/index";

const StarredPage = ({ messages }) => {
    const user = useSelector((state) => state.auth.user);

    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";

    // Updated state management
    const [emails, setEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentEmail, setCurrentEmail] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 25;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Updated fetch function with pagination
    const fetchStarredConversations = async (page) => {
        try {
            setIsLoading(true);
            const response = await conversationsService.getAllConversations(
                "Starred",
                page,
                pageSize
            );

            const transformedEmails = response.data.map((conversation) => ({
                id: conversation.id,
                subject: conversation.subject,
                sender: conversation.senderName,
                senderEmail: conversation.senderEmail,
                senderPictureURL: conversation.senderPictureURL,
                receiver: conversation.receiverName,
                receiverEmail: conversation.receiverEmail,
                receiverPictureURL: conversation.receiverPictureURL,
                lastMessageSenderId: conversation.lastMessage.senderId,
                lastMessageReceiverId: conversation.lastMessage.receiverId,
                body: conversation.lastMessage.content,
                date: new Date(conversation.lastMessage.sentAt),
                read: conversation.lastMessage.isRead,
                attachments: conversation.lastMessage.attachements.map((att) => ({
                    name: att.name,
                    url: att.fileURL,
                    size: att.size,
                })),
                isStarred: true,
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
        fetchStarredConversations(pageNumber);
    }, [pageNumber]);

    const handleEmailSelect = useCallback(
        (emailId) => {
            const selected = emails.find((email) => email.id === emailId);
            setCurrentEmail(selected || null);
        },
        [emails]
    );

    const handleUnstar = async (emailId) => {
        try {
            await conversationsService.changeConversationStatus(emailId, "Active");
            const updatedEmails = emails.filter((email) => email.id !== emailId);
            setEmails(updatedEmails);
            setCurrentEmail(null);
        } catch (error) {
            console.error("Error removing from starred:", error);
        }
    };
    const handleArchive = async (emailId) => {
        try {
            await conversationsService.changeConversationStatus(emailId, "Archived");
            const updatedEmails = emails.filter((email) => email.id !== emailId);
            setEmails(updatedEmails);
            setCurrentEmail(null);
        } catch (error) {
            setError(error.message);
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

    // Handle real-time messages
    useEffect(() => {
        if (messages && messages.length > 0) {
            const latestMessage = messages[messages.length - 1];
            // If we receive a new message in a starred conversation
            if (
                latestMessage.type === "message" ||
                latestMessage.type === "received"
            ) {
                const newMessage = latestMessage.content;

                // Check if this message belongs to any existing starred conversation
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

    // Add pagination handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPageNumber(newPage);
        }
    };

    return (
        <div
            className={`flex flex-col ${isRTL ? "rtl" : "ltr"}`}
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
                                        <Star className="w-6 h-6 text-yellow-500" />
                                        <h1 className="text-2xl font-bold ">{t("starred.title")}</h1>
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

                            <div className="overflow-y-auto overflow-x-auto h-[calc(100vh-132px)]">
                                <ul className="">
                                    {emails.map((email) => (
                                        <li key={email.id} className="email-item">
                                            <EmailListItem
                                                page="starred"
                                                email={email}
                                                onSelect={handleEmailSelect}
                                                isSelected={currentEmail?.id === email.id}
                                                onUnstar={handleUnstar}
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
                            onDelete={handleDeleteEmail}
                            onGoBack={() => setCurrentEmail(null)}
                            onToggleStar={handleUnstar}
                            onArchive={handleArchive}
                            isStarred={true}
                            messages={messages}
                        />
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

export default StarredPage;
