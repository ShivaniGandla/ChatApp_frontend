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
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    socket.on("previous-messages", (msgs) => {
      setMessages(msgs.map((msg) => ({ username: msg.username, text: msg.text })));
    });

    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("user-joined", (user) => {
      setMessages((prev) => [...prev, { username: "System", text: `${user} joined the chat` }]);
    });

    socket.on("user-left", (user) => {
      setMessages((prev) => [...prev, { username: "System", text: `${user} left the chat` }]);
    });

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

  const joinChat = () => {
    if (username.trim().length >= 2) {
      setJoined(true);
      socket.emit("user-joined", username);
    } else {
      alert("Username must be at least 2 characters.");
    }
  };

  const sendMessage = () => {
    if (input.trim()) {
      const msg = { username, text: input };
      socket.emit("send-message", msg);
      setInput("");
    }
  };

  const handleTyping = () => {
    if (username) socket.emit("typing", username);
  };

  if (!joined) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #c3cfe2)",
          fontFamily: "Arial, sans-serif",
          boxSizing: "border-box",
          padding: "20px",
        }}
      >
        <div style={{ width: "400px", maxHeight: "100%", display: "flex", flexDirection: "column" }}>
          <h2 style={{ color: "#004C99", textAlign: "center" }}>💬 Real-Time Chat App</h2>

          <div
            style={{
              backgroundColor: "#CCE5FF",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "25px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>How to Use:</h3>
            <ol style={{ paddingLeft: "20px" }}>
              <li>Open this URL in <strong>two separate browsers</strong>.</li>
              <li>Arrange the tabs side by side to see updates in real-time.</li>
              <li>Enter unique usernames and click <strong>Join Chat</strong>.</li>
              <li>Type messages in each chat and see the <strong>typing indicator</strong>.</li>
              <li>Close one tab and check the <strong>user left notification</strong>.</li>
            </ol>
          </div>

          <input
            type="text"
            placeholder="Type your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "12px",
              width: "100%",
              marginBottom: "15px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
          <button
            onClick={joinChat}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
        paddingTop: "40px",
        paddingBottom: "40px",
      }}
    >
      <div style={{ width: "400px" }}>
        <h2 style={{ textAlign: "center", color: "#004C99", marginBottom: "20px" }}>💬 Real-Time Chat App</h2>

        <div
          style={{
            height: "50vh",
            overflowY: "auto",
            borderRadius: "12px",
            padding: "15px",
            backgroundColor: "#f0f8ff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {messages.map((msg, i) => {
            const isSystem = msg.username === "System";
            const isMe = msg.username === username;
            return (
              <div
                key={i}
                style={{
                  alignSelf: isSystem ? "center" : isMe ? "flex-end" : "flex-start",
                  backgroundColor: isSystem ? "#ffe0e0" : isMe ? "#d1ffd6" : "#ffffff",
                  color: isSystem ? "#ff6f61" : "#333",
                  padding: "10px 15px",
                  margin: "5px 0",
                  borderRadius: "15px",
                  maxWidth: "80%",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  fontWeight: isSystem ? "bold" : "normal",
                }}
              >
                <strong>{msg.username}:</strong> {msg.text}
              </div>
            );
          })}
        </div>

        {typingUser && (
          <p style={{ color: "#ff9800", marginTop: "10px", fontStyle: "italic" }}>
            {typingUser} is typing...
          </p>
        )}

        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <input
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
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
            onClick={sendMessage}
            style={{
              padding: "12px 18px",
              borderRadius: "8px",
              backgroundColor: "#2196F3",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;