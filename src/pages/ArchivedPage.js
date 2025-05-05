import { AnimatePresence, motion } from "framer-motion";
import { Archive } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
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
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5;

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

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

      if (page === 1) {
        setEmails(transformedEmails);
      } else {
        setEmails((prev) => [...prev, ...transformedEmails]);
      }

      setTotalCount(response.count);
      setHasMore(response.data.length === pageSize);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations(1);
  }, []);

  // Load more when scrolling
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPageNumber((prev) => prev + 1);
      fetchConversations(pageNumber + 1);
    }
  }, [inView, hasMore, isLoading]);

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

  return (
    <div
      className={`flex flex-col overflow-hidden ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ maxHeight: "calc(100vh - 4rem)" }}
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
              className="flex-grow overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-100 z-10 px-4 py-3 border-b rounded-xl">
                <div className="flex items-center gap-2">
                  <Archive className="w-6 h-6 text-gray-600" />
                  <h1 className="text-2xl font-bold">{t("archived.title")}</h1>
                </div>
              </div>
              <div className="px-4">
                {emails.length === 0 && !isLoading ? (
                  <div className="text-center text-gray-500 mt-8">
                    {t("archived.empty")}
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {emails.map((email) => (
                      <li key={email.id} className="email-item">
                        <EmailListItem
                          page="archived"
                          email={email}
                          onSelect={handleEmailSelect}
                          isSelected={currentEmail?.id === email.id}
                          onArchive={handleUnarchive}
                          isArchived={true}
                          isSent={email.senderEmail === user.email}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {hasMore && (
                  <div
                    ref={loadMoreRef}
                    className="h-10 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                    ) : (
                      t("archived.loading_more")
                    )}
                  </div>
                )}
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
