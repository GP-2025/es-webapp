import axiosInstance from "./axiosConfig";

export const messageService = {
  sendMessage: async (conversationId, content, attachments) => {
    const formData = new FormData();
    formData.append("Content", content);
    formData.append("ParentMessageId", conversationId || "");

    if (attachments) {
      formData.append("Attachements", attachments);
    }

    const response = await axiosInstance.post(
      `/Message/SendMessage/${conversationId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  saveDraft: async (content, receiverId, conversationId, attachments) => {
    const formData = new FormData();
    formData.append("Content", content);
    formData.append("ReceiverId", receiverId);
    formData.append("ParentMessageId", conversationId);
    formData.append("Attachements", attachments || "");

    const response = await axiosInstance.post(
      `/Message/SaveDraftMessage/${conversationId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  deleteMessageForMe: async (messageId) => {
    const response = await axiosInstance.post(
      `/Message/DeleteForMe/${messageId}`
    );
    return response.data;
  },

  deleteMessageForEveryone: async (messageId) => {
    const response = await axiosInstance.post(
      `/Message/DeleteForEveryOne/${messageId}`
    );
    return response.data;
  },
};
