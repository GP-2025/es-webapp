import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import debounce from "lodash/debounce";
import { ChevronDown, Inbox, SendHorizontal } from "lucide-react";
import { conversationsService } from "../services/conversationsService";

const SearchInput = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState("inbox");
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const navigate = useNavigate();

  const searchTypes = [
    {
      id: "inbox",
      label: t("inbox.inbox").split(" ")[1 - !isRTL],
      icon: <Inbox className="w-4 h-4" />,
    },
    {
      id: "sent",
      label: t("sent.title").split(" ")[1 - !isRTL],
      icon: <SendHorizontal className="w-4 h-4" />,
    },
  ];

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await conversationsService.getAllConversations(
          searchType,
          1,
          5,
          query
        );

        const transformedResults = response.data.map((conversation) => ({
          id: conversation.id,
          subject: conversation.subject,
          sender: conversation.senderName,
          senderEmail: conversation.senderEmail,
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
    }, 300),
    [searchType]
  );
  const handleTypeSelect = (type) => {
    setSearchType(type);
    setShowTypeMenu(false);
    if (search.trim()) {
      performSearch(search);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearch(query);
    performSearch(query);
  };

  const handleItemSelect = (email) => {
    navigate("/home/search", {
      state: {
        email: email,
        fromSearch: true,
      },
    });
    setSearch("");
    setSearchResults([]);
  };

  const handleSeeAllResults = () => {
    navigate("/home/searchList", {
      state: {
        filteredEmails: searchResults,
        fromSearch: true,
      },
    });
    setSearch("");
    setSearchResults([]);
  };

  return (
    <div
      className={`sticky top-2 ${
        isRTL ? "left-4" : "right-4"
      } z-[20] w-[40vw] sm:w-[100vw] max-w-sm flex gap-2  flex-row-reverse`}
    >
      <button
        onClick={() => setShowTypeMenu(!showTypeMenu)}
        className="px-3 appearance-none rounded-xl border border-gray-300 bg-white text-gray-800 flex gap-2 items-center hover:border-gray-500 transition-colors"
      >
        <span className="flex items-center">
          {searchTypes.find((type) => type.id === searchType)?.icon}
        </span>
        <span className="hidden sm:inline">
          {searchTypes.find((type) => type.id === searchType)?.label}
        </span>
      </button>
      <div className={`relative flex-1`}>
        <input
          onChange={handleSearchChange}
          value={search}
          type="search"
          placeholder={t("search.Searchemails")}
          className={`w-full sm:w-[30vw] h-12 rounded-xl border border-gray-300 bg-white text-gray-800 ps-12 pe-3 outline-none focus:border-gray-500`}
          dir={isRTL ? "rtl" : "ltr"}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`absolute start-3 top-1/2 -translate-y-1/2 h-6 w-6 stroke-gray-400 z-[9999]`}
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
            className={`absolute z-[20] ${
              !isRTL ? "right-0" : "left-0"
            } mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto
            w-[70vw] md:max-w-md`}
            dir={!isRTL ? "rtl" : "ltr"}
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto"></div>
              </div>
            ) : (
              <>
                {searchResults.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleItemSelect(email)}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    <div className="font-semibold">{email.subject}</div>
                    <div className="text-sm text-gray-600">{email.sender}</div>
                    <div className="text-xs text-gray-500">
                      {email.date.toLocaleDateString(i18n.language)}
                    </div>
                  </div>
                ))}
                {searchResults.length > 0 && (
                  <div
                    onClick={handleSeeAllResults}
                    className="px-4 py-2 text-center bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200 cursor-pointer"
                  >
                    {t("search.SeeAllResults")}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {showTypeMenu && (
        <div
          className={`absolute top-full ${
            !isRTL ? "right-0" : "left-0"
          } w-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg`}
        >
          {searchTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className={`w-full flex items-center gap-2 ${
                isRTL ? "text-right" : "text-left"
              } p-2 hover:bg-gray-100 ${
                searchType === type.id ? "bg-blue-50" : ""
              }`}
            >
              {type.icon}
              <span className="sm:inline">{type.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
