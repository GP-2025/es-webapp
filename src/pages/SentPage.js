import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // Import the hook
import { useInView } from "react-intersection-observer";
import EmailDetail from "../components/EmailDetail";
import EmailListItem from "../components/EmailList/index";
import { conversationsService } from "../services/conversationsService";

const SentPage = ({ messages }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  // State management
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEmail, setCurrentEmail] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  console.log("emails", emails);
  

  // Add intersection observer
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  // Add fetch conversations function
  const fetchConversations = async (PageNumber) => {
    // console.log(PageNumber, "page");
    try {
      setIsLoading(true);
      const response = await conversationsService.getAllConversations(
        "sent",
        PageNumber,
        pageSize
      );
      // console.log(response.data, "response");
      const transformedEmails = response.data.map((conversation) => ({
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
        hasDraft: conversation.hasDraftMessage,
      }));

      if (pageNumber === 1) {
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

  // Add useEffects for initial load and infinite scroll
  useEffect(() => {
    fetchConversations(pageNumber);
  }, []);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      fetchConversations(nextPage);
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

  // Handler to select an email and mark as read
  const handleEmailSelect = (emailId) => {
    const selected = emails.find((email) => email.id === emailId);
    setCurrentEmail(selected);

    // Mark email as read
    const updatedEmails = emails.map((email) =>
      email.id === emailId ? { ...email, read: true } : email
    );
    setEmails(updatedEmails);
  };

  // Handler to clear the current email view
  const handleClearCurrentEmail = () => {
    setCurrentEmail(null);
  };

  // Handler to delete an email
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
              className="flex-grow overflow-y-auto"
            >
              <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-300 rounded-t-lg">
                <div className="select-none flex items-center gap-2">
                  <Send className="w-6 h-6 text-blue-600" />
                  <h1 className="text-2xl font-bold">{t("sent.title")}</h1>
                </div>
              </div>
              
              <div className="overflow-y-auto overflow-x-auto pb-10 h-[calc(100vh-124px)]">
                <ul className="">
                  {emails.map((email) => (
                    <li key={email.id} className="email-item">
                      <EmailListItem
                        page="sent"
                        email={email}
                        onSelect={handleEmailSelect}
                        onArchive={handleArchive}
                        isSelected={currentEmail?.id === email.id}
                        isSent={true}
                      />
                    </li>
                  ))}
                </ul>

                {/* Loading indicator */}
                {/* {hasMore && (
                  <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                    ) : (
                      t("sent.loading_more")
                    )}
                  </div>
                )} */}
              </div>
            </motion.div>
          ) : (
            <EmailDetail
              key="email-detail"
              email={currentEmail}
              onGoBack={handleClearCurrentEmail}
              onDelete={() => handleDeleteEmail(currentEmail.id)}
              sent={true}
              onArchive={handleArchive}
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

export default SentPage;
