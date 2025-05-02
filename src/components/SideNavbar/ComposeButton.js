// ComposeButton.jsx
import React from "react";
import { FiEdit2 } from "react-icons/fi";

const ComposeButton = ({ isOpen, setcompose, t }) => {
  return (
    <button
      onClick={() => setcompose(true)}
      className={`
        flex items-center justify-center
        min-w-[40px] h-12 gap-2
        transition-all duration-100 ease-in-out
        rounded-xl bg-blue-300 hover:bg-blue-400 m-2
        ${isOpen ? "w-fit px-3" : "w-12"}
      `}
    >
      <FiEdit2 className="flex-shrink-0 w-5 h-5 font-semibold text-gray-700 text-center  " />
      <span
        className={`
          font-semibold text-gray-700
          whitespace-nowrap overflow-hidden
          transition-all duration-100 ease-in-out
          ${isOpen ? "w-auto opacity-100" : "hidden w-0 opacity-0"}
        `}
      >
        {t("Compose.Compose")}
      </span>
    </button>
  );
};
export default ComposeButton;
