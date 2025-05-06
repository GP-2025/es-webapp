import axiosInstance from "./axiosConfig";

export const emailService = {
  getAllEmails: async (params) => {
    const response = await axiosInstance.get("/emails", { params });
    return response.data;
  },

  getEmailById: async (id) => {
    const response = await axiosInstance.get(`/emails/${id}`);
    return response.data;
  },

  sendEmail: async (emailData) => {
    const response = await axiosInstance.post("/emails/send", emailData);
    return response.data;
  },

  deleteEmail: async (id) => {
    const response = await axiosInstance.delete(`/emails/${id}`);
    return response.data;
  },

  moveToTrash: async (id) => {
    const response = await axiosInstance.put(`/emails/${id}/trash`);
    return response.data;
  },
};

export const sendReply = async (body, conversationId, attachments, token) => {
  try {
    const formData = new FormData();
    formData.append("Content", body);

    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => {
        formData.append("Attachements", file);
      });
    }

    const response = await axiosInstance.post(
      `/Message/SendMessage/${conversationId}`,
      formData,
      {
        headers: {
          accept: "*/*",
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error sending reply:", error);
    throw error;
  }
};

export const saveDraft = async (content, conversationId, attachments) => {
  // console.log(conversationId, "iddd");
  const formData = new FormData();
  formData.append("Id", "");
  formData.append("Content", content);
  formData.append("ParentMessageId", conversationId);
  formData.append("IsDraft", false);

  try {
    const response = await axiosInstance.post(
      `/Message/SaveDraftMessage/${conversationId}`,
      formData,
      {
        headers: {
          accept: "*/*",
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error saving draft:", error);
    throw error;
  }
};

export const composeEmail = async (emailData) => {
  // console.log(emailData, "emaillldata");
  const formData = new FormData();
  emailData.id && formData.append("id", emailData.id);
  formData.append("Subject", emailData.subject);
  formData.append("ReceiverId", emailData.receiverId);
  formData.append("Message.Content", emailData.content);

  // Handle attachments properly
  if (emailData.attachments && emailData.attachments.length > 0) {
    emailData.attachments.forEach((file) => {
      formData.append("Message.Attachments", file);
    });
  } else {
    formData.append("Message.Attachments", null);
  }

  try {
    const response = await axiosInstance.post(
      "/Conversations/Compose",
      formData,
      {
        headers: {
          accept: "*/*",
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error composing email:", error);
    throw error.response?.data?.message || "Failed to compose email";
  }
};

export const deleteMessage = async (messageId) => {
  try {
    const response = await axiosInstance.post(
      `/Message/DeleteForMe/${messageId}`,
      null,
      {
        headers: {
          accept: "*/*",
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

export const deleteMessageForMe = async (messageId) => {
  try {
    const response = await axiosInstance.post(
      `/Message/DeleteForMe/${messageId}`,
      null,
      {
        headers: {
          accept: "*/*",
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

export const deleteMessageForEveryone = async (messageId) => {
  try {
    const response = await axiosInstance.post(
      `/Message/DeleteForEveryOne/${messageId}`,
      null,
      {
        headers: {
          accept: "*/*",
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};
