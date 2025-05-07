import { NullLogger } from "@microsoft/signalr";
import axiosInstance from "./axiosConfig";

export const conversationsService = {
  getAllConversations: async (
    type = "sent",
    PageNumber = 1,
    pageSize = 10,
    search = ""
  ) => {
    try {
      const response = await axiosInstance.get(
        `/Conversations/AllConversations`,
        {
          params: {
            type,
            PageNumber,
            pageSize,
            search,
          },
          headers: {
            accept: "text/plain",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  },

  composeDraft: async (subject, receiverId, body, attachments = []) => {
    try {
      const formData = new FormData();
      formData.append("Subject", subject);
      formData.append("ReceiverId", receiverId);
      formData.append("Body", body);

      // Add attachments if any
      if (attachments && attachments.length > 0) {
        attachments.forEach((file) => {
          formData.append("Attachments", file);
        });
      }

      const response = await axiosInstance.post(
        "/Conversations/ComposeDraft",
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
      console.error("Error composing draft:", error);
      throw error;
    }
  },

  getConversationById: async (conversationId) => {
    try {
      const response = await axiosInstance.get(
        `/Conversations/GetConversationById`,
        {
          params: { ConversationId: conversationId },
          headers: {
            accept: "text/plain",
          },
        }
      );

      // Transform the response to match our email format
      const messages = response.data.messages.map((message) => ({
        id: message.id,
        sender:
          message.senderEmail === response.data.senderEmail
            ? response.data.senderName
            : response.data.receiverName,
        senderEmail: message.senderEmail,
        senderPictureURL:
          message.senderEmail === response.data.senderEmail
            ? response.data.senderPictureURLURL
            : response.data.receiverPictureURL,
        body: message.content,
        date: new Date(message.sentAt),
        read: message.isRead,
        attachments: message.attachements || [], // Note: API response has "attachements" with an 'e'
      }));

      return {
        id: response.data.id,
        subject: response.data.subject,
        messages: messages,
        senderName: response.data.senderName,
        senderEmail: response.data.senderEmail,
        senderPictureURL: response.data.senderPictureURLURL,
        receiverName: response.data.receiverName,
        receiverEmail: response.data.receiverEmail,
        receiverPicture: response.data.receiverPictureURL,
        draftMessage: response.data.draftMessage,
      };
    } catch (error) {
      console.error("Error fetching conversation:", error);
      throw error;
    }
  },

  changeConversationStatus: async (conversationId, status) => {
    try {
      const response = await axiosInstance.post(
        `/Conversations/ChangeConversationStatus/${conversationId}/${status}`,
        null,
        {
          headers: {
            accept: "*/*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error changing conversation status to ${status}:`, error);
      throw error;
    }
  },

  getDeletedConversations: async (
    PageNumber = 1,
    pageSize = 10,
    search = ""
  ) => {
    try {
      const response = await axiosInstance.get(
        `/Conversations/AllConversations`,
        {
          params: {
            type: "Deleted",
            PageNumber,
            pageSize,
            search,
          },
          headers: {
            accept: "text/plain",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching deleted conversations:", error);
      throw error;
    }
  },

  getDraftConversations: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(
        "/Conversations/DraftConversations",
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
          },
          headers: {
            accept: "text/plain",
          },
        }
      );
      // console.log(response.data, "datadrafffft");
      return response.data;
    } catch (error) {
      console.error("Error fetching draft conversations:", error);
      throw error;
    }
  },
};

export const deleteConversation = async (conversationId) => {
  try {
    const response = await axiosInstance.post(
      `/Conversations/ChangeConversationStatus/${conversationId}/Deleted`,
      null,
      {
        headers: {
          accept: "*/*",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};

export const toggleStarredStatus = async (conversationId) => {
  try {
    const response = await axiosInstance.post(
      `/Conversations/ChangeConversationStatus/${conversationId}/Starred`,
      null,
      {
        headers: {
          accept: "*/*",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error toggling starred status:", error);
    throw error;
  }
};
