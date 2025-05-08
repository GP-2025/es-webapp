import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
    conversationsService,
    deleteConversation,
    deleteConversationPermanently,
    restoreConversation
} from "../../services/conversationsService";
import ForwardList from "../ForwardList";

import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
    deleteMessageForEveryone,
    deleteMessageForMe,
} from "../../services/emailService";
import DeleteConfirmationModal from "./DeleteConfim";
import EmailMessage from "./EmailMessage";
import EmailHeader from "./Header";
import Replay from "./Replay";
import { getCookie } from "../../utils/cookieUtils";
import { successToast } from "../../utils/toastConfig";

const EmailDetail = ({
    email,
    onGoBack,
    onDelete,
    onArchive,
    isArchived,
    fromSearch,
    onToggleStar,
    isStarred,
    isTrash,
    messages,
}) => {
    const { t } = useTranslation();
    const [composeOpen, setComposeOpen] = useState(false);
    const [replyOpen, setReplyOpen] = useState(false);
    const [composeData, setComposeData] = useState(null);
    const [componentWidth, setComponentWidth] = useState(0);
    const [conversation, setConversation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const emailDetailRef = useRef(null);
    const isOpen = useSelector((state) => state.auth.sidebarOpen);
    const [menuOpen, setMenuOpen] = useState(null);
    
    const emailHeaderRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        if (emailHeaderRef.current) {
        setHeaderHeight(emailHeaderRef.current.offsetHeight);
        }

        // Optional: Recalculate on window resize
        const handleResize = () => {
            if (emailHeaderRef.current) {
                setHeaderHeight(emailHeaderRef.current.offsetHeight);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        type: null,
        messageId: null,
    });

    // Handle real-time messages for the open conversation
    useEffect(() => {
        if (
            messages &&
            messages.length > 0 &&
            messages[messages.length - 1].type === "message"
        ) {
            const latestMessage = messages[messages.length - 1];

            // Transform the new message to match our message format
            const newMessage = {
                id: latestMessage.content.id,
                sender: latestMessage.content.senderName,
                senderEmail: latestMessage.content.senderEmail,
                senderPictureURL: latestMessage.content.senderPictureURLURL,
                body: latestMessage.content.content,
                date: new Date(latestMessage.content.sentAt),
                attachments:
                    latestMessage.content.attachements?.map((att) => ({
                        name: att.name,
                        url: att.fileURL,
                        size: att.size,
                    })) || [],
            };
            // console.log(newMessage, "new message in details");
            // Append the new message to the conversation
            setConversation((prev) => ({
                ...prev,
                messages: [newMessage, ...prev.messages],
            }));
            // console.log("setConversation,indetails");
        }
    }, [messages]);

    const fetchConversation = async () => {
        try {
            setIsLoading(true);
            const data = await conversationsService.getConversationById(email.id);

            setConversation(data);
        } catch (error) {
            console.error("Error fetching conversation:", error);
            toast.error("Failed to update conversation");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (email?.id) {
            fetchConversation();
        }
    }, [email?.id]);

    useEffect(() => {
        if (emailDetailRef.current) {
            setComponentWidth(emailDetailRef.current.offsetWidth);
        }
    }, [isOpen]);

    const handleReply = () => {
        setReplyOpen(true);
    };

    const handleForward = () => {
        setComposeOpen(true);
    };

    const closeCompose = () => {
        setComposeOpen(false);
        setComposeData(null);
    };

    const closeReply = () => {
        setReplyOpen(false);
        setComposeData(null);
        fetchConversation();
    };

    const handleDeleteMessage = async (type) => {
        try {
            const token = getCookie("token");
            if (type === "forMe") {
                await deleteMessageForMe(confirmModal.messageId, token);
            } else {
                await deleteMessageForEveryone(confirmModal.messageId, token);
            }
            setConfirmModal({ open: false, type: null, messageId: null });
            fetchConversation();
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("Failed to delete message");
        }
    };

    const handleConversationDelete = async () => {
        try {
            const token = getCookie("token");
            await deleteConversation(email.id, token);
            onDelete && onDelete(email.id);
            onGoBack && onGoBack();
        } catch (error) {
            console.error("Error deleting conversation:", error);
            toast.error("Failed to delete conversation");
        }
    };

    const handleDeleteClick = () => {
        setConfirmModal({
            open: true,
            type: "conversation",
            onConfirm: handleConversationDelete,
        });
    };

    const handleConversationDeletePermanently = async () => {
        try {
            const token = getCookie("token");
            const response = await deleteConversationPermanently(email.id, token);
            onDelete && onDelete(email.id);
            onGoBack && onGoBack();
            if (response.status)
                successToast(t("email.deleteSuccess"))
            else
                successToast(t("email.deleteFailed"))
        } catch (error) {
            console.error("Error permanently deleting conversation:", error);
            toast.error("Failed to permanently delete conversation");
        }
    };

    const handleDeletePermanentlyClick = () => {
        console.log("||||||| welcome back to trash ||||||||||||||")
        setConfirmModal({
            open: true,
            type: "permanent_delete",
            onConfirm: handleConversationDeletePermanently,
        });
    };

    const handleArchiveClick = async () => {
        try {
            await onArchive(email.id);
            onGoBack();
        } catch (error) {
            console.error("Error archiving/unarchiving:", error);
            toast.error("Failed to archive/unarchive conversation");
        }
    };

    const handleRestoreClick = async () => {
        try {
            const response = await restoreConversation(email.id);
            onGoBack();
            if (response.status == 200) {
                onDelete && onDelete(email.id);
                successToast(t("email.restoreSuccess"))
            }
            else
                successToast(t("email.restoreFailed"))
        } catch (error) {
            console.error("Error restoring conversation:", error);
            toast.error("Failed to restoring conversation");
        }
    };

    if (!email) return null;


    return (
        <div className="rounded-t-lg">
            <div className="rounded-t-lg">
                <EmailHeader
                    email={email}
                    onGoBack={onGoBack}
                    onReply={handleReply}
                    onForward={handleForward}
                    onDelete={handleDeleteClick}
                    onDeletePermanently={handleDeletePermanentlyClick}
                    onArchive={handleArchiveClick}
                    onRestore={handleRestoreClick}
                    isArchived={isArchived}
                    isStarred={isStarred}
                    isTrash={isTrash}
                    onToggleStar={onToggleStar}
                    className="sticky top-0 z-10 bg-white"
                    ref={emailHeaderRef}
                />

                <div
                    className="overflow-auto"
                    style={{
                        // height: `calc(100vh - ${emailDetailRef.current?.offsetHeight || 0}px)`,
                        // height: `calc(100vh)`,
                        // maxHeight: `calc(100vh - ${headerHeight}px)`,

                    }}
                >
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        </div>
                    ) : (
                        conversation?.messages.map((message) => (
                            <EmailMessage
                                key={message.id}
                                message={message}
                                menuOpen={menuOpen}
                                setMenuOpen={setMenuOpen}
                                setConfirmModal={setConfirmModal}
                            />
                        ))
                    )}
                </div>
                <div className="fixed bottom-0 left-0 right-0 md:absolute sm:hidden">
                    <Replay
                        width={componentWidth}
                        open={replyOpen}
                        onClose={closeReply}
                        email={email}
                        conversationid={conversation?.id}
                        draftMessage={conversation?.draftMessage}
                    />
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 md:absolute hidden lg:block">
                <Replay
                    width={componentWidth}
                    open={replyOpen}
                    onClose={closeReply}
                    email={email}
                    conversationid={conversation?.id}
                    draftMessage={conversation?.draftMessage}
                />
            </div>
            <DeleteConfirmationModal
                confirmModal={confirmModal}
                setConfirmModal={setConfirmModal}
                handleConversationDelete={handleConversationDelete}
                handleConversationDeletePermanently={handleConversationDeletePermanently}
                handleDeleteMessage={handleDeleteMessage}
            />
            {composeOpen && (
                <ForwardList
                    open={composeOpen}
                    onClose={closeCompose}
                    email={email}
                    conversation={conversation}
                />
            )}
        </div>
    );
};

export default EmailDetail;
