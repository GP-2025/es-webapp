import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // Import the hook
import { useLocation, useNavigate } from "react-router-dom";

import EmailDetail from "../components/EmailDetail";
import EmailListItem from "../components/EmailList/";

const SearchListPage = ({ messages }) => {
    const { t } = useTranslation(); // Access translation function
    const navigate = useNavigate();
    
    const location = useLocation();
    const { filteredEmails = [] } = location.state || {};
    
    console.log("filteredEmails", filteredEmails)

    const [emails, setEmails] = useState(filteredEmails);
    const [currentEmail, setCurrentEmail] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalCount, setTotalCount] = useState(filteredEmails.length);
    const pageSize = 25;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // Handle real-time updates to search results
    useEffect(() => {
        if (messages && messages.length > 0) {
            const latestMessage = messages[messages.length - 1];
            if (
                latestMessage.type === "message" ||
                latestMessage.type === "received"
            ) {
                const newMessage = latestMessage.content;

                // Check if this message belongs to any conversation in search results
                const existingEmailIndex = emails.findIndex(
                    (email) => email.id === newMessage.conversationId
                );

                if (existingEmailIndex !== -1) {
                    // Update existing conversation in search results
                    const updatedEmails = [...emails];
                    updatedEmails[existingEmailIndex] = {
                        ...updatedEmails[existingEmailIndex],
                        body: newMessage.content,
                        date: new Date(newMessage.sentAt),
                        read: false,
                    };
                    setEmails(updatedEmails);
                }
            }
        }
    }, [messages]);

    const handleItemSelect = (email) => {
        navigate("/home/search", {
            state: {
                email: email,
                fromSearch: true,
                fromSearchList: true,
            },
        });
    };

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

    const handleClearCurrentEmail = useCallback(() => {
        setCurrentEmail(null);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPageNumber(newPage);
        }
    };

    return (
        <div className="flex flex-col h-fit">
            {currentEmail ? (
                <EmailDetail
                    key="email-detail"
                    email={currentEmail}
                    onGoBack={handleClearCurrentEmail}
                    isArchived={false}
                    isStarred={false}
                    fromSearch={true}
                />
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key="email-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-grow overflow-y-auto"
                    >
                        <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-300">
                            <div className="flex items-center gap-2">
                                <Search className="w-6 h-6 text-blue-500" />
                                <h1 className="text-2xl font-bold">{t("search.results")}</h1>
                            </div>
                        </div>
                        <div className="">
                            <ul className="">
                                {emails.map((email) => (
                                    <li key={email.id} className="email-item">
                                        <EmailListItem
                                            page="search"
                                            email={email}
                                            onSelect={handleEmailSelect}
                                            isSelected={currentEmail?.id === email.id}
                                            isRead={true}
                                            isSent={false}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default SearchListPage;
