// ComposeButton.jsx
import React from "react";
import { FiEdit2 } from "react-icons/fi";

const ComposeButton = ({ isOpen, setcompose, t }) => {
    return (
        <button
            onClick={() => setcompose(true)}
            className={`
                flex items-center justify-center py-3 px-3.5 gap-2
                transition-all duration-700 ease-in-out
                rounded-xl dark:bg-blue-600 dark:hover:bg-blue-700 m-2
                ${isOpen ? "w-fit px-3" : "w-auto"}
            `}
        >
            <FiEdit2 className="flex-shrink-0 w-5 h-5 my-0.5 font-semibold text-white text-center  " />
            <span className={`font-semibold text-white ${isOpen ? "inline" : "hidden"} `}>
                {t("Compose.Compose")}
            </span>
        </button>
    );
};
export default ComposeButton;
