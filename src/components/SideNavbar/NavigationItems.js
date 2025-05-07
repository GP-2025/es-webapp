// NavigationItems.jsx
import React from "react";
import {
    FiArchive,
    FiFile,
    FiInbox,
    FiSend,
    FiStar,
    FiTrash2,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";

const NavigationItems = ({ isOpen, t, isRTL }) => {
    const navItems = [
        {
            text: t("inbox.inbox"),
            icon: <FiInbox />,
            path: "/home/inbox",
            color: "text-blue-600",
        },
        {
            text: t("sent.title"),
            icon: <FiSend />,
            path: "/home/sent",
            color: "text-blue-600",
        },
        {
            text: t("starred.title"),
            icon: <FiStar />,
            path: "/home/starred",
            color: "text-yellow-600",
        },
        {
            text: t("draft.draft"),
            icon: <FiFile />,
            path: "/home/drafts",
            color: "text-gray-600",
        },
        {
            text: t("archived.title"),
            icon: <FiArchive />,
            path: "/home/archived",
            color: "text-gray-600",
        },
        {
            text: t("trash.title"),
            icon: <FiTrash2 />,
            path: "/home/trash",
            color: "text-red-600",
        },
    ];

    return (
        <ul className={`space-y-1 pe-2 ${isRTL ? "pr-0" : "pl-0"}`}>
            {navItems.map((item) => (
                <li key={item.text}>
                    <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center ps-5 py-1 transition-all duration-200 w-10 hover:bg-gray-400 rounded-e-xl
              ${isActive
                                ? `${item.color} bg-opacity-20 font-semibold bg-blue-600 hover:bg-opacity-40`
                                : `${item.color} text-opacity-70 hover:bg-opacity-25`
                            } w-full h-10`
                        }
                    >
                        <span className="text-xl">{item.icon}</span>
                        {isOpen && <span className="ms-2">{item.text}</span>}
                    </NavLink>
                </li>
            ))}
        </ul>
    );
};
export default NavigationItems;
