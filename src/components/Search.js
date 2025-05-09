import debounce from "lodash/debounce";
import { Inbox, SendHorizontal } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { conversationsService } from "../services/conversationsService";
import { useSelector } from "react-redux";

const SearchInput = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchType, setSearchType] = useState("inbox");
    const [showTypeMenu, setShowTypeMenu] = useState(false);
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const user = useSelector((state) => state.auth.user);

    const maxItemsSizeNoScroll = 5;
    const pageSize = 8;

    const searchTypes = [
        {
            id: "inbox",
            label: t("inbox.inbox"),
            icon: <Inbox className="w-4 h-4" />,
        },
        {
            id: "sent",
            label: t("sent.title"),
            icon: <SendHorizontal className="w-4 h-4" />,
        },
    ];

    // Debounced search function that takes searchType as an argument
    const performSearch = React.useRef(
        debounce(async (query, type) => {
            setQuery(query)
            if (!query.trim()) {
                setSearchResults([]);
                return;
            }

            try {
                setIsLoading(true);
                const response = await conversationsService.getAllConversations(
                    type,
                    1,
                    pageSize,
                    query
                );
                
                const transformedResults = response.data.map((conversation) => ({
                    id: conversation.id,
                    subject: conversation.subject,
                    sender: conversation.senderName,
                    senderEmail: conversation.senderEmail,
                    receiver: conversation.receiverName,
                    receiverEmail: conversation.receiverEmail,
                    date: new Date(conversation.lastMessage.sentAt),
                    body: conversation.lastMessage.content,
                }));

                setSearchResults(transformedResults);
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300)
    ).current;


    const handleTypeSelect = (type) => {
        setSearchType(type);
        setShowTypeMenu(false);
        if (search.trim()) {
            performSearch(search, type);
        }
    };

    const handleSearchChange = (event) => {
        const query = event.target.value;
        setSearch(query);
        performSearch(query, searchType);
    };

    const handleItemSelect = (email) => {
        navigate("/home/search", {
            state: {
                email: email,
                fromSearch: true,
            },
        });
        setSearchResults([]);
    };

    const handleSeeAllResults = () => {
        navigate("/home/searchList", {
            replace: true,
            state: {
                type: searchType,
                query: query,
                filteredEmails: searchResults,
                fromSearch: true,
            },
        });
        window.location.reload();
        setSearchResults([]);
    };

    // Add a ref to the type menu and button
    const typeMenuRef = React.useRef(null);

    // Close the type menu when clicking outside
    React.useEffect(() => {
        if (!showTypeMenu) return;

        const handleClickOutside = (event) => {
            if (
                typeMenuRef.current &&
                !typeMenuRef.current.contains(event.target)
            ) {
                setShowTypeMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showTypeMenu]);

    // Add a ref to the main search container
    const searchContainerRef = React.useRef(null);

    // Close the search results when clicking outside the search container
    React.useEffect(() => {
        if (!searchResults.length) return;

        const handleClickOutside = (event) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target)
            ) {
                setSearchResults([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchResults]);


    return (
        <div
            ref={searchContainerRef}
            className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-2 z-[20]"
        >
            <div className="relative flex-1 gap-2">
                <input
                    onChange={handleSearchChange}
                    value={search}
                    type="text"
                    className="lg:w-[800px] md:w-[calc(100vw-235px)] w-[calc(100vw-185px)] h-12 rounded-xl border border-gray-300 text-gray-800 ps-12 pe-3 outline-none focus:border-gray-500 focus:bg-white"
                    dir={isRTL ? "rtl" : "ltr"}
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`absolute start-3 top-3 h-6 w-6 stroke-gray-300`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="gray"
                    strokeWidth="3"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>

                {search && (searchResults.length > 0 || isLoading) && (
                    <div
                        className={`
                            absolute mt-1 bg-white border border-gray-200 rounded-xl shadow-lg lg:w-[800px]
                            overflow-y-auto max-h-64 md:max-h-96 lg:max-h-96
                        `}
                        dir={!isRTL ? "rtl" : "ltr"}
                    >
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-500">
                                <div className="animate-spin rounded-xl h-6 w-6 border-b-2 border-gray-500 mx-auto"></div>
                            </div>
                        ) : (
                            <>
                                {searchResults.map((email, index) => (
                                    <div
                                        key={email.id}
                                        onClick={() => handleItemSelect(email)}
                                        className={`px-4 py-2 hover:bg-gray-200 cursor-pointer text-end
                                            ${index === searchResults.length - 1 && searchResults.length <= maxItemsSizeNoScroll ? "rounded-b-xl" : ""}
                                            ${index === 0 ? "rounded-t-xl" : ""}
                                        `}
                                    >
                                        <div className="font-semibold">{email.subject}</div>
                                        <div className="flex">
                                            <div className="text-xs text-gray-500 me-auto">{email.date.toLocaleDateString()}</div>
                                            <div className="text-sm text-gray-600">{
                                                    email.senderEmail === user.email
                                                        ? email.receiver
                                                        : email.sender
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {searchResults.length > maxItemsSizeNoScroll && (
                                    <div
                                        onClick={handleSeeAllResults}
                                        className="sticky bottom-0 px-4 py-2 text-center bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200 cursor-pointer"
                                    >
                                        {t("search.SeeAllResults")}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-col items-center gap-2" ref={typeMenuRef}>
                <button
                    onClick={() => setShowTypeMenu(!showTypeMenu)}
                    className="
                        lg:w-24 h-12 focus:outline-offset-2 focus:outline-gray-500
                        px-3 appearance-none rounded-xl border border-gray-300 bg-white text-gray-400
                        flex gap-2 items-center hover:border-gray-500 hover:text-gray-600 transition-colors
                    "
                >
                    <span className="flex items-center">
                        {searchTypes.find((type) => type.id === searchType)?.icon}
                    </span>
                    <span className="hidden sm:inline">
                        {searchTypes.find((type) => type.id === searchType)?.label}
                    </span>
                </button>

                {showTypeMenu && (
                    <div className="lg:w-24 mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                        {searchTypes.map((type) => (
                            <button
                                id={type.id}
                                key={type.id}
                                onClick={() => handleTypeSelect(type.id)}
                                className={`
                                    w-full flex items-center gap-2 py-2 px-3
                                    hover:bg-gray-300 transition-colors duration-100 ease-in-out
                                    ${isRTL ? "text-right" : "text-left"}
                                    ${searchType === type.id ? "bg-gray-200" : ""}
                                    ${type.id === "inbox" ? "rounded-t-lg" : "rounded-b-lg"}
                                `}
                            >
                                {type.icon}
                                <span className="hidden sm:inline">{type.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchInput;
