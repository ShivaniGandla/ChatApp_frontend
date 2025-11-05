import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://chatapp-backend-e9z2.onrender.com", {
  transports: ["websocket"],
});

function App() {
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [joined, setJoined] = useState(false); // track if user has joined

  // 🟢 Socket listeners
  useEffect(() => {
    // Previous messages (persistence)
    socket.on("previous-messages", (msgs) => {
      setMessages(msgs.map((msg) => ({ username: msg.username, text: msg.text })));
    });

    // New messages
    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // User joined
    socket.on("user-joined", (user) => {
      setMessages((prev) => [...prev, { username: "System", text: `${user} joined the chat` }]);
    });

    // User left
    socket.on("user-left", (user) => {
      setMessages((prev) => [...prev, { username: "System", text: `${user} left the chat` }]);
    });

    // Typing indicator
    socket.on("typing", (user) => {
      if (user !== username) {
        setTypingUser(user);
        setTimeout(() => setTypingUser(""), 2000);
      }
    });

    return () => {
      socket.off("previous-messages");
      socket.off("chat-message");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("typing");
    };
  }, [username]);

  // 🟢 Join chat handler
  const joinChat = () => {
    if (username.trim().length >= 2) { // minimum 2 chars to join
      setJoined(true);
      socket.emit("user-joined", username);
    } else {
      alert("Username must be at least 2 characters.");
    }
  };

  // 🟢 Send message
  const sendMessage = () => {
    if (input.trim()) {
      const msg = { username, text: input };
      socket.emit("send-message", msg);
      setInput("");
    }
  };

  // 🟢 Handle typing
  const handleTyping = () => {
    if (username) socket.emit("typing", username);
  };

  // 🟢 UI
  if (!joined) {
    return (
      <div style={{ width: "400px", margin: "50px auto", textAlign: "center" }}>
        <h2>Enter your username</h2>
        <input
          type="text"
          placeholder="Type your name..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "8px", width: "80%", marginBottom: "10px" }}
        />
        <br />
        <button
          onClick={joinChat}
          style={{
            padding: "8px 15px",
            borderRadius: "5px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Join Chat
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: "400px", margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>💬 Real-Time Chat App</h2>

      <div style={{ height: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              fontWeight: msg.username === "System" ? "bold" : "normal",
              color: msg.username === username ? "blue" : "black",
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
          onKeyDown={(e) => {
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