import axiosInstance from "./axiosInstance";
import { getCookie } from "../utils/cookieUtils";

const getContacts = async () => {
  try {
    const accessToken = getCookie("token");
    const response = await axiosInstance.get(
      "/Conversations/ValidUsersToSend",
      {
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in getContacts:", error);
    throw error;
  }
};

export default getContacts;
