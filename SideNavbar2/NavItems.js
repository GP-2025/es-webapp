// components/SideNavbar/NavItems.js
import { Edit2, File } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiInbox, FiSend, FiTrash2 } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { toggleSidebar } from "../../store/slices/authSlice";
import ComposeModal from "../ComposeModal";

const NavItems = ({ isOpen }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [compose, setCompose] = useState(false);
  const [hovered, setHovered] = useState(false);

  const navItems = [
    {
      text: t("inbox.inbox"),
      icon: <FiInbox />,
      path: "/home/inbox",
      color: "text-blue-600",
    },
    {
      text: t("draft.draft"),
      icon: <File />,
      path: "/home/drafts",
      color: "text-green-600",
    },
    {
      text: t("sent.title"),
      icon: <FiSend />,
      path: "/home/sent",
      color: "text-purple-600",
    },
    {
      text: t("trash.title"),
      icon: <FiTrash2 />,
      path: "/home/trash",
      color: "text-red-600",
    },
  ];

  const handleMouseInteraction = (enter) => {
    if (!isOpen) {
      setHovered(enter);
      dispatch(toggleSidebar(enter));
    }
  };

  return (
    <div
      className="mt-24"
      onMouseEnter={() => handleMouseInteraction(true)}
      onMouseLeave={() => handleMouseInteraction(false)}
    >
      <button
        onClick={() => setCompose(true)}
        className={`flex items-center ml-3 p-3 rounded-lg transition-all cursor-pointer
          duration-200 text-gray-900 text-xl bg-blue-500 
          ${isOpen ? "w-fit" : "w-9/12 px-2 py-3 mx-auto"} mb-2`}
      >
        <span className="transition-opacity duration-200 ease-in-out">
          <Edit2 />
        </span>
        {isOpen && (
          <span className="ml-3 transition-transform duration-200 ease-in-out transform scale-100">
            {t("Compose.Compose")}
          </span>
        )}
      </button>

      <ul className="space-y-2 px-2">
        {navItems.map((item) => (
          <li key={item.text}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-all duration-200 w-10 hover:bg-blue-500 ${
                  isActive
                    ? `${item.color} bg-opacity-20 font-semibold bg-blue-600 hover:bg-opacity-40`
                    : `${item.color} text-opacity-70 hover:bg-opacity-25`
                } w-full`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && <span className="ml-3">{item.text}</span>}
            </NavLink>
          </li>
        ))}
      </ul>

      {compose && (
        <ComposeModal open={compose} onClose={() => setCompose(false)} />
      )}
    </div>
  );
};

export default NavItems;
