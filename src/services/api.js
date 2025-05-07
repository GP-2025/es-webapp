import axios from "./axiosConfig";

const api = {
    auth: {
        login: async (credentials) => {
            const response = await axios.post("/Auth/LogIn", credentials);
            return response.data;
        },
        refresh: async () => {
            const response = await axios.get("/Auth/Refresh");
            return response.data;
        },
    },

    conversations: {
        getAll: async (params) => {
            const response = await axios.get("/Conversations/AllConversations", {
                params,
            });
            return response.data;
        },
        getById: async (conversationId) => {
            const response = await axios.get(
                `/Conversations/GetConversationById/${conversationId}`
            );
            return response.data;
        },
        compose: async (formData) => {
            const response = await axios.post("/Conversations/Compose", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        changeStatus: async (conversationId, status) => {
            const response = await axios.post(
                `/Conversations/ChangeConversationStatus/${conversationId}/${status}`
            );
            return response.data;
        },
    },

    messages: {
        send: async (conversationId, formData) => {
            const response = await axios.post(
                `/Message/SendMessage/${conversationId}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            return response.data;
        },
        deleteForMe: async (messageId) => {
            const response = await axios.post(`/Message/DeleteForMe/${messageId}`);
            return response.data;
        },
        deleteForEveryone: async (messageId) => {
            const response = await axios.post(
                `/Message/DeleteForEveryOne/${messageId}`
            );
            return response.data;
        },
    },
};

export default api;
