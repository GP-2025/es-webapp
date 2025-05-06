import axiosInstance from "./axiosConfig";

export const conversationService = {
  getAllConversations: async (
    type = "sent",
    page = 1,
    pageSize = 10,
    search = ""
  ) => {
    // console.log(useremail);
    const response = await axiosInstance.get(
      "/Conversations/AllConversations",
      {
        params: { type, page, pageSize, search },
        headers: { accept: "text/plain" },
      }
    );
    return response.data;
  },

  getConversationById: async (conversationId) => {
    const response = await axiosInstance.get(
      "/Conversations/GetConversationById",
      {
        params: { ConversationId: conversationId },
        headers: { accept: "text/plain" },
      }
    );
    return response.data;
  },

  composeEmail: async (emailData) => {
    const formData = new FormData();
    formData.append("Subject", emailData.subject);
    formData.append("ReceiverId", emailData.receiverId);
    formData.append("Message.Content", emailData.content);

    if (emailData.attachments?.length > 0) {
      emailData.attachments.forEach((file) => {
        formData.append("Message.Attachments", file);
      });
    }

    const response = await axiosInstance.post(
      "/Conversations/Compose",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  deleteConversation: async (conversationId) => {
    const response = await axiosInstance.post(
      `/Conversations/ChangeConversationStatus/${conversationId}/Deleted`
    );
    return response.data;
  },
};
