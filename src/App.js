import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://chatapp-backend-e9z2.onrender.com", {
  transports: ["websocket"],
});

function App() {
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!username) {
      const name = prompt("Enter your username:");
      if (name) {
        setUsername(name);
        socket.emit("user-joined", name);
      }
    }

    // ✅ Message listener
    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    // ✅ User joined
    const handleUserJoined = (user) => {
      setMessages((prev) => [
        ...prev,
        { username: "System", text: `${user} joined the chat` },
      ]);
    };

    // ✅ User left
    const handleUserLeft = (user) => {
      setMessages((prev) => [
        ...prev,
        { username: "System", text: `${user} left the chat` },
      ]);
    };

    socket.on("chat-message", handleMessage);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("chat-message", handleMessage);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
    };
  }, [username]);

  const sendMessage = () => {
    if (input.trim()) {
      const msg = { username, text: input };
      socket.emit("send-message", msg);
      setMessages((prev) => [...prev, msg]);
      setInput("");
    }
  };

  return (
    <div style={{ width: "400px", margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>💬 Real-Time Chat App</h2>

      <div
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          backgroundColor: "#fff",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.username}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "15px", display: "flex" }}>
        <input
          style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          style={{
            marginLeft: "10px",
            padding: "8px 15px",
            borderRadius: "5px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;