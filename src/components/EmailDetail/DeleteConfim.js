import React, { useEffect, useRef } from "react";

function DeleteConfirmationModal({
  confirmModal,
  setConfirmModal,
  handleConversationDelete,
  handleDeleteMessage,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    // Handle escape key
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setConfirmModal({ open: false });
      }
    };

    // Handle click outside
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setConfirmModal({ open: false });
      }
    };

    // Add event listeners
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setConfirmModal]);

  if (!confirmModal.open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
      >
        <h3 className="text-lg font-semibold mb-4">
          {confirmModal.title || "Confirm Delete"}
        </h3>
        <p className="mb-4 text-gray-600">
          {confirmModal.message || "Are you sure you want to delete this item?"}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setConfirmModal({ open: false })}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (confirmModal.type === "conversation") {
                handleConversationDelete();
              } else {
                handleDeleteMessage(confirmModal.type);
              }
              setConfirmModal({ open: false });
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
