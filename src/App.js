import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://chatapp-backend-e9z2.onrender.com", {
  transports: ["websocket"],
});

function App() {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    if (username) {
      localStorage.setItem("username", username);
      socket.emit("user-joined", username);
    }

    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleUserJoined = (user) => {
      setMessages((prev) => [...prev, { username: "System", text: `${user} joined the chat` }]);
    };

    const handleUserLeft = (user) => {
      setMessages((prev) => [...prev, { username: "System", text: `${user} left the chat` }]);
    };

    const handleTyping = (user) => {
      if (user !== username) {
        setTypingUser(user);
        setTimeout(() => setTypingUser(""), 2000);
      }
    };

    socket.on("chat-message", handleMessage);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("chat-message", handleMessage);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("typing", handleTyping);
    };
  }, [username]);

  const joinChat = () => {
    if (username.trim()) {
      localStorage.setItem("username", username);
      socket.emit("user-joined", username);
    }
  };

  const sendMessage = () => {
    if (input.trim()) {
      const msg = { username, text: input };
      socket.emit("send-message", msg);
      setMessages((prev) => [...prev, msg]);
      setInput("");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", username);
  };

  return (
    <div style={{ width: "400px", margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      {!username ? (
        <div style={{ textAlign: "center" }}>
          <h2>Enter your username</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Type your name..."
            style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", marginRight: "10px" }}
          />
          <button
            onClick={joinChat}
            style={{ padding: "8px 15px", borderRadius: "5px", border: "none", backgroundColor: "#4CAF50", color: "#fff", cursor: "pointer" }}
          >
            Join Chat
          </button>
        </div>
      ) : (
        <div>
          <h2 style={{ textAlign: "center" }}>Welcome, {username} 👋</h2>
          <div style={{ height: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
            {messages.map((msg, i) => (
              <div key={i}>
                <strong>{msg.username}:</strong> {msg.text}
              </div>
            ))}
          </div>
          {typingUser && <p style={{ fontStyle: "italic", color: "#555" }}>{typingUser} is typing...</p>}
          <div style={{ display: "flex", marginTop: "15px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleTyping}
              onKeyUp={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <button
              onClick={sendMessage}
              style={{ marginLeft: "10px", padding: "8px 15px", borderRadius: "5px", border: "none", backgroundColor: "#4CAF50", color: "#fff", cursor: "pointer" }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;