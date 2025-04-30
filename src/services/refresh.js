import axios from "axios";

const refreshToken = async () => {
  try {
    const response = await axios.get(
      "https://emailingsystemapi.runasp.net/api/Auth/Refresh",
      {
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.data) {
      localStorage.setItem("token", response.data);
      return response.data;
    }

    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

export default refreshToken;
