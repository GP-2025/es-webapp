import { AnimatePresence, motion } from "framer-motion";
import { File } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
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
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  // Fetch draft conversations
  const fetchDraftConversations = async (page) => {
    try {
      setIsLoading(true);
      const response = await conversationsService.getDraftConversations(
        page,
        pageSize
      );

      // Transform the response data to match EmailList expectations
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
        attachments: email.attachments || [],
        senderPicture: email.senderPicture || "Empty",
        recipientPicture: email.recipientPicture || "Empty",
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
    fetchDraftConversations(1);
  }, []);

  // Load more when scrolling
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      fetchDraftConversations(nextPage);
    }
  }, [inView, hasMore, isLoading]);

  const handleEmailSelect = (selected) => {
    if (selected) {
      setCurrentEmail(selected);
    }
  };

  const handleClearCurrentEmail = () => {
    fetchDraftConversations(pageNumber);

    setCurrentEmail(null);
  };

  return (
    <div
      className={`flex flex-col overflow-hidden ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ maxHeight: "calc(100vh - 4rem)" }}
    >
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
                <File className="w-6 h-6 text-yellow-600" />
                <h1 className="text-2xl font-bold">{t("draft.draft")}</h1>
              </div>
            </div>

            {isLoading && emails.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t("draft.empty")}
              </div>
            ) : (
              <div className="px-4">
                <ul className="space-y-2">
                  {emails.map((email) => (
                    <li key={email.id}>
                      <EmailListItem
                        email={email}
                        onSelect={() => handleEmailSelect(email)}
                        isSelected={currentEmail?.id === email.id}
                        page="draft"
                        isSent={email.senderEmail === user.email}
                      />
                    </li>
                  ))}
                </ul>

                {hasMore && (
                  <div
                    ref={loadMoreRef}
                    className="py-4 text-center text-gray-500"
                  ></div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="compose-mail"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
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
