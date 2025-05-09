import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const DeleteMenu = ({ messageId, senderEmail, setConfirmModal, setMenuOpen }) => {
    const user = useSelector((state) => state.auth.user);
    const { t } = useTranslation();

    return (
        <div className="absolute end-0 mt-1 w-48 bg-white shadow-lg z-10 border border-gray-200 rounded-lg">
            <button
                onClick={() => {
                    setConfirmModal({ open: true, type: "forMe", messageId });
                    setMenuOpen(null);
                }}
                className={`w-full text-left px-4 py-3 ${senderEmail === user.email ? "rounded-t-lg" : "rounded-lg"} text-sm text-gray-700 hover:bg-gray-200`}
            >
                {t("email.deleteForMe")}
            </button>
            {senderEmail === user.email && (
                <button
                    onClick={() => {
                        setConfirmModal({ open: true, type: "forEveryone", messageId });
                        setMenuOpen(null);
                    }}
                    className="w-full text-left px-4 py-3 rounded-b-lg text-sm text-gray-700 hover:bg-gray-200"
                >
                    {t("email.deleteForEveryone")}
                </button>
            )}
        </div>
    );
};

export default DeleteMenu;
