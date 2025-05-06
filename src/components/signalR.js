// WebSocketNotifier.js
import * as signalR from "@microsoft/signalr";
import React, { useEffect, useState } from "react";

const WebSocketNotifier = () => {
  const [messages, setMessages] = useState([]);
  const accessToken =
    "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJBSE1FRFNBQURAR01BSUwuQ09NIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiU2VjcmV0YXJ5IiwiZXhwIjoxNzQ0NTk5NjAwLCJpc3MiOiJFbWFpbCIsImF1ZCI6IkVtYWlsaW5nU3lzdGVtQXVkaWVuY2UifQ.0NM4AnpCn4vC9N0Hll5tW4PuhXx4x5KGlceY78pVioA";

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`wss://emailingsystemapi.runasp.net/hubs/notify`, {
        accessTokenFactory: () => accessToken,
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        // console.log("Connected to SignalR hub");

        // Subscribe to a method the server will call (e.g., "ReceiveMessage")
        connection.on("ReceiveMessage", (message) => {
          // console.log("New message:", message);
          setMessages((prevMessages) => [...prevMessages, message]);
        });
      })
      .catch((error) => console.error("SignalR connection error:", error));

    return () => {
      connection.stop();
    };
  }, []);

  return (
    <div>
      <h2>SignalR Messages</h2>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>{JSON.stringify(msg)}</li>
        ))}
      </ul>
    </div>
  );
};

export default WebSocketNotifier;
