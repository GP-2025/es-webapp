import React from "react";
import { useTranslation } from "react-i18next";

const DeleteMenu = ({ messageId, setConfirmModal, setMenuOpen }) => {
  const { t } = useTranslation();

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-10 py-1">
      <button
        onClick={() => {
          setConfirmModal({ open: true, type: "forMe", messageId });
          setMenuOpen(null);
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        {t("email.deleteForMe")}
      </button>
      <button
        onClick={() => {
          setConfirmModal({ open: true, type: "forEveryone", messageId });
          setMenuOpen(null);
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        {t("email.deleteForEveryone")}
      </button>
    </div>
  );
};

export default DeleteMenu;
