import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { getCookie } from "../utils/cookieUtils";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { setSignalRConnected } from "../store/slices/authSlice";

const SignalRConnection = () => {
  const [status, setStatus] = useState("Disconnected");
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus("Not Authenticated");
      if (connection) {
        connection
          .stop()
          .then(() => {
            console.log("[SignalR] Connection stopped due to logout");
            dispatch(setSignalRConnected(false));
          })
          .catch((err) =>
            console.error("[SignalR] Error stopping connection:", err)
          );
      }
      return;
    }

    const token = getCookie("token");
    if (!token) {
      setStatus("No Token Available");
      return;
    }

    // Cleanup previous connection if it exists
    if (connection) {
      connection
        .stop()
        .then(() => console.log("[SignalR] Previous connection stopped"))
        .catch((err) =>
          console.error("[SignalR] Error stopping previous connection:", err)
        );
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Debug)
      .withUrl("https://emailingsystemapi.runasp.net/hubs/notify", {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
      .build();

    setConnection(newConnection);

    newConnection.on("Notification", (message) => {
      console.log("[SignalR] Notification received:", message);
      // toast.info(
      //   typeof message === "string" ? message : JSON.stringify(message)
      // );
      setMessages((prev) => [
        ...prev,
        { type: "notification", content: message, timestamp: new Date() },
      ]);
    });

    newConnection.on("MessageInsideConversation", (message) => {
      console.log("[SignalR] New conversation message:", message);
      setMessages((prev) => [
        ...prev,
        { type: "message", content: message, timestamp: new Date() },
      ]);
    });

    newConnection.on("ReceiveMessage", (message) => {
      console.log("[SignalR] Message received:", message);
      setMessages((prev) => [
        ...prev,
        { type: "received", content: message, timestamp: new Date() },
      ]);
    });

    newConnection.onclose((error) => {
      console.log(
        "[SignalR] Connection closed",
        error ? "with error: " + error : ""
      );
      setStatus("Disconnected");
      // toast.error("Real-time connection lost. Attempting to reconnect...");
    });

    newConnection.onreconnecting((error) => {
      console.log("[SignalR] Attempting to reconnect...", error);
      setStatus("Reconnecting...");
    });

    newConnection.onreconnected((connectionId) => {
      console.log("[SignalR] Reconnected. Connection ID:", connectionId);
      setStatus("Connected");
      toast.success("Real-time connection restored!");
    });

    // Start the connection
    newConnection
      .start()
      .then(() => {
        console.log("[SignalR] Connection established successfully");
        setStatus("Connected");
        dispatch(setSignalRConnected(true));
        // toast.success("Real-time connection established!");
      })
      .catch((err) => {
        console.error("[SignalR] Connection failed:", err);
        setStatus("Connection Failed");
        dispatch(setSignalRConnected(false));
        toast.error(
          "Failed to establish real-time connection. Please refresh the page."
        );
      });

    // Cleanup on unmount or when authentication/token changes
    return () => {
      if (newConnection) {
        newConnection
          .stop()
          .then(() => {
            console.log("[SignalR] Connection stopped");
            dispatch(setSignalRConnected(false));
          })
          .catch((err) =>
            console.error("[SignalR] Error stopping connection:", err)
          );
      }
    };
  }, [isAuthenticated, dispatch]); // Now depends on authentication state

  return { status, messages, connection };
};

export default SignalRConnection;
