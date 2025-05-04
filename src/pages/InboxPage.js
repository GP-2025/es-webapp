import { AnimatePresence, motion } from "framer-motion";
import { Inbox } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { useSelector } from "react-redux";
import EmailDetail from "../components/EmailDetail";
import EmailListItem from "../components/EmailList/index";
import { conversationsService } from "../services/conversationsService";

const InboxPage = ({ messages }) => {
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
  const pageSize = 10;

  // Handle real-time messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      console.log(latestMessage, "latest in inbox");
      // If we receive a new message in a conversation
      if (
        latestMessage.type === "message" ||
        latestMessage.type === "received"
      ) {
        const newMessage = latestMessage.content;

        // Check if this message belongs to any existing conversation
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
        } else {
          // This is a new conversation, fetch the latest conversations
          fetchConversations(1);
        }
      }
    }
  }, [messages]);

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  // Fetch conversations with pagination
  const fetchConversations = async (PageNumber) => {
    try {
      setIsLoading(true);
      const response = await conversationsService.getAllConversations(
        "inbox",
        PageNumber,
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
        hasDraft: conversation.hasDraftMessage,
      }));

      if (PageNumber === 1) {
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
    fetchConversations(pageNumber);
  }, []);

  // Load more when scrolling
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      fetchConversations(nextPage);
    }
  }, [inView, hasMore, isLoading]);

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
  // Email handlers remain the same
  const handleEmailSelect = useCallback(
    (emailId) => {
      const selected = emails.find((email) => email.id === emailId);
      setCurrentEmail(selected || null);

      const updatedEmails = emails.map((email) =>
        email.id === emailId ? { ...email, read: true } : email
      );
      setEmails(updatedEmails);
    },
    [emails]
  );

  // Email deletion handler
  const handleDeleteEmail = useCallback(
    (emailId) => {
      const updatedEmails = emails.filter((email) => email.id !== emailId);
      setEmails(updatedEmails);
      setCurrentEmail(null);
    },
    [emails]
  );

  // Clear current email selection
  const handleClearCurrentEmail = useCallback(() => {
    setCurrentEmail(null);
  }, []);

  // Archive handler
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

  // Responsive layout with RTL support
  return (
    <div
      className={`bg-blue-100 -ms-1 flex flex-col ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {error ? (
        <div className="text-red-500 text-center">{error}</div>
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
              <div className="sticky top-0 bg-blue-100 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Inbox className="w-6 h-6 text-blue-500" />
                  <h1 className="text-2xl font-bold ">{t("inbox.inbox")}</h1>
                </div>
              </div>

              <div className="overflow-y-auto pb-10 h-[calc(100vh-124px)]">
                <ul className="">
                  {emails.map((email) => {
                    return (
                      <li key={email.id} className="email-item">
                        <EmailListItem
                          email={email}
                          onSelect={handleEmailSelect}
                          isSelected={currentEmail?.id === email.id}
                          onArchive={handleArchive}
                          isArchived={false}
                          page="inbox"
                          isSent={false}
                        />
                      </li>
                    );
                  })}
                </ul>

                {/* Loading indicator */}
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
              </div>
            </motion.div>
          ) : (
            <EmailDetail
              key="email-detail"
              email={currentEmail}
              onGoBack={handleClearCurrentEmail}
              onDelete={handleDeleteEmail}
              onArchive={handleArchive}
              isArchived={false}
              onToggleStar={handleStar}
              isStarred={false}
              messages={messages}
            />
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default InboxPage;
