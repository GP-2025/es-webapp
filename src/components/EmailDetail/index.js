import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  conversationsService,
  deleteConversation,
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

const EmailDetail = ({
  email,
  onGoBack,
  onDelete,
  onArchive,
  isArchived,
  fromSearch,
  onToggleStar,
  isStarred,
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
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
      title: "Delete Conversation",
      message: "Are you sure you want to delete this conversation?",
      onConfirm: handleConversationDelete,
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

  if (!email) return null;

  return (
    <>
      <div className=" overflow-y-auto shadow md:shadow-xl overflow-auto min-h-screen rounded-t-lg">
        <EmailHeader
          email={email}
          onGoBack={onGoBack}
          onReply={handleReply}
          onForward={handleForward}
          onDelete={handleDeleteClick}
          onArchive={handleArchiveClick}
          isArchived={isArchived}
          isStarred={isStarred}
          onToggleStar={onToggleStar}
          className="sticky top-0 z-10 bg-white"
        />

        <div className="mt-4">
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
                // DeleteMenu={<DeleteMenu setConfirmModal={setConfirmModal} />}
              />
            ))
          )}
        </div>
        <div className="fixed bottom-0 left-0 right-0 md:absolute sm:hidden  ">
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
      <div className="fixed bottom-0 left-0 right-0 md:absolute hidden  lg:block">
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
    </>
  );
};

export default EmailDetail;
