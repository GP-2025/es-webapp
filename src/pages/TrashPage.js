import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { useSelector } from "react-redux";
import EmailListItem from "../components/EmailList/index";
import { conversationsService } from "../services/conversationsService";

const TrashPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const user = useSelector((state) => state.auth.user);
  // State management
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEmail, setCurrentEmail] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  // Fetch deleted conversations
  const fetchDeletedConversations = async (page) => {
    try {
      setIsLoading(true);
      const response = await conversationsService.getDeletedConversations(
        page,
        pageSize
      );

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
    fetchDeletedConversations(1);
  }, []);

  // Load more when scrolling
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      fetchDeletedConversations(nextPage);
    }
  }, [inView, hasMore, isLoading]);

  const handleEmailSelect = useCallback(
    (emailId) => {
      const selected = emails.find((email) => email.id === emailId);
      setCurrentEmail(selected);

      const updatedEmails = emails.map((email) =>
        email.id === emailId ? { ...email, read: true } : email
      );
      setEmails(updatedEmails);
    },
    [emails]
  );

  const handleDeleteEmail = useCallback(
    (emailId) => {
      const updatedEmails = emails.filter((email) => email.id !== emailId);
      setEmails(updatedEmails);
      setCurrentEmail(null);
    },
    [emails]
  );

  const handleClearCurrentEmail = useCallback(() => {
    setCurrentEmail(null);
  }, []);

  return (
    <div
      className={`bg-white -ms-1 flex flex-col border border-gray-300 rounded-t-lg`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key="email-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow"
          >
            <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-300 rounded-t-lg">
            <div className="select-none flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-red-500" />
                <h1 className="text-2xl font-bold">{t("trash.title")}</h1>
              </div>
            </div>

            <div className="overflow-y-auto overflow-x-auto pb-10 h-[calc(100vh-124px)]">
              {isLoading && emails.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                </div>
              ) : (
                <ul className="">
                  {emails.map((email) => (
                    <li key={email.id} className="email-item">
                      <EmailListItem
                        page="trash"
                        email={email}
                        onSelect={handleEmailSelect}
                        isSelected={currentEmail?.id === email.id}
                        isSent={email.senderEmail == user.email}
                        isTrash={true}
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
                  {isLoading && (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default TrashPage;
