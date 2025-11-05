import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Connect to your backend
const socket = io("https://chatapp-backend-e9z2.onrender.com", {
  transports: ["websocket"],
});

function App() {
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    // Ask username only if not already set
    if (!username) {
      const name = prompt("Enter your username:");
      if (name) {
        setUsername(name);
        socket.emit("user-joined", name);
      }
    }

    // ✅ Receive previous messages from backend
    socket.on("previous-messages", (msgs) => {
      setMessages(msgs.map((msg) => ({ username: msg.username, text: msg.text })));
    });

    // ✅ Receive new messages
    socket.on("chat-message", (data) => setMessages((prev) => [...prev, data]));

    // ✅ User joined
    socket.on("user-joined", (user) =>
      setMessages((prev) => [...prev, { username: "System", text: `${user} joined the chat` }])
    );

    // ✅ User left
    socket.on("user-left", (user) =>
      setMessages((prev) => [...prev, { username: "System", text: `${user} left the chat` }])
    );

    // ✅ Typing indicator
    socket.on("typing", (user) => {
      if (user !== username) {
        setTypingUser(user);
        setTimeout(() => setTypingUser(""), 2000);
      }
    });

    // Cleanup listeners
    return () => {
      socket.off("previous-messages");
      socket.off("chat-message");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("typing");
    };
  }, [username]);

  const sendMessage = () => {
    if (input.trim()) {
      const msg = { username, text: input };
      socket.emit("send-message", msg); // Send to backend
      setMessages((prev) => [...prev, msg]); // Optimistically add
      setInput("");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", username);
  };

  return (
    <div style={{ width: "400px", margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>💬 Real-Time Chat App</h2>

      <div style={{ height: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              margin: "5px 0",
              fontWeight: msg.username === "System" ? "bold" : "normal",
              color: msg.username === username ? "#4CAF50" : "#000",
            }}
          >
            <strong>{msg.username}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {typingUser && <p>{typingUser} is typing...</p>}

      <div style={{ marginTop: "15px", display: "flex" }}>
        <input
          style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            handleTyping();
            if (e.key === "Enter") sendMessage();
          }}
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