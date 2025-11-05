import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("https://chatapp-backend-e9z2.onrender.com", {
  transports: ["websocket"], // ✅ connect via WebSocket
});

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    socket.on("chat-message", (data) => {
      setMessages((prev) => [...prev, data]);
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
      socket.off("chat-message");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("typing");
    };
  }, [username]);

  const joinChat = () => {
    if (username.trim()) {
      socket.emit("user-joined", username);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const data = { username, text: message };
      socket.emit("send-message", data);
      setMessages((prev) => [...prev, data]);
      setMessage("");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", username);
  };

  return (
    <div className="App">
      {!username ? (
        <div className="username-container">
          <h2>Enter your username</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Type your name..."
          />
          <button onClick={joinChat}>Join Chat</button>
        </div>
      ) : (
        <div className="chat-container">
          <h2>Welcome, {username} 👋</h2>

          <div className="messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.username === username ? "my-message" : msg.username === "System" ? "system-message" : ""
                }`}
              >
                <strong>{msg.username}:</strong> {msg.text}
              </div>
            ))}
          </div>

          {typingUser && <p className="typing">{typingUser} is typing...</p>}

          <div className="input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleTyping}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;