import React from "react";
import { useTranslation } from "react-i18next";

const DeleteMenu = ({ messageId, setConfirmModal, setMenuOpen }) => {
    const { t } = useTranslation();

    return (
        <div className="absolute end-0 mt-1 w-48 bg-white shadow-lg z-10 border border-gray-200 rounded-xl">
            <button
                onClick={() => {
                    setConfirmModal({ open: true, type: "forMe", messageId });
                    setMenuOpen(null);
                }}
                className="w-full text-left px-4 py-3 rounded-t-lg text-sm text-gray-700 hover:bg-gray-200"
            >
                {t("email.deleteForMe")}
            </button>
            <button
                onClick={() => {
                    setConfirmModal({ open: true, type: "forEveryone", messageId });
                    setMenuOpen(null);
                }}
                className="w-full text-left px-4 py-3 rounded-b-lg text-sm text-gray-700 hover:bg-gray-200"
            >
                {t("email.deleteForEveryone")}
            </button>
        </div>
    );
};

export default DeleteMenu;
