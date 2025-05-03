import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
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
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.3,
  });

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
        senderPicture: conversation.senderPictureURL,
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
        isStarred: true,
      }));

      if (page === 1) {
        setEmails(transformedEmails);
      } else {
        setEmails((prev) => [...prev, ...transformedEmails]);
      }

      setTotalCount(response.count);
      setHasMore(
        response.data.length === pageSize && emails.length < response.count
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStarredConversations(1);
  }, []);

  // Load more when scrolling
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      fetchStarredConversations(nextPage);
    }
  }, [inView, hasMore, isLoading]);

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

  return (
    <div
      className={`flex flex-col h-screen ${isRTL ? "rtl" : "ltr"}`}
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
              <div
                className={`sticky top-0 bg-white dark:bg-gray-100 z-10 px-4 py-3 border-b rounded-xl mt-1  ${
                  isRTL ? "ml-1" : "mr-1"
                } mb-1`}
              >
                <div className="flex items-center gap-2 ">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <h1 className="text-2xl font-bold ">{t("starred.title")}</h1>
                </div>
              </div>

              {isLoading && emails.length === 0 ? null : (
                <ul className="space-y-3">
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
              )}

              {hasMore && (
                <div
                  ref={loadMoreRef}
                  className="h-10 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                  ) : (
                    t("inbox.loading_more")
                  )}
                </div>
              )}
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
