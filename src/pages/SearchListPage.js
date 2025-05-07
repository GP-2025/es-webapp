import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // Import the hook
import { useLocation, useNavigate } from "react-router-dom";

import EmailListItem from "../components/EmailList/";

const SearchListPage = ({ messages }) => {
    const { t } = useTranslation(); // Access translation function

    const navigate = useNavigate();

    const location = useLocation();
    const { filteredEmails = [] } = location.state || {};

    const [emails, setEmails] = useState(filteredEmails);

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
        // console.log("email selected", email);

        navigate("/home/search", {
            state: {
                email: email,
                fromSearch: true,
                fromSearchList: true,
            },
        });
    };

    return (
        <div className="flex flex-col h-fit">
            <AnimatePresence mode="wait">
                <motion.div
                    key="email-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-grow overflow-y-auto"
                >
                    <div className="sticky top-0 bg-white dark:bg-gray-100 z-10 px-4 py-3 border-b">
                        <div className="flex items-center gap-2">
                            <Search className="w-6 h-6 text-blue-500" />
                            <h1 className="text-2xl font-bold">{t("search.results")}</h1>
                        </div>
                    </div>
                    <div className="px-4 ">
                        <ul className="space-y-3">
                            {emails.map((email) => (
                                <li key={email.id} className="email-item">
                                    <EmailListItem
                                        email={email}
                                        onSelect={handleItemSelect}
                                        page="search"
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default SearchListPage;
