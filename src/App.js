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
    // Prompt for username only if not saved
    if (!username) {
      const name = prompt("Enter your username:");
      if (name) {
        setUsername(name);
        localStorage.setItem("username", name);
        socket.emit("user-joined", name);
      }
    } else {
      socket.emit("user-joined", username);
    }
  }, []);

  useEffect(() => {
    const handleMessage = (data) => setMessages((prev) => [...prev, data]);
    const handleUserJoined = (user) =>
      setMessages((prev) => [...prev, { username: "System", text: `${user} joined the chat` }]);
    const handleUserLeft = (user) =>
      setMessages((prev) => [...prev, { username: "System", text: `${user} left the chat` }]);
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

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { username, text: input };
    socket.emit("send-message", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  const handleTyping = () => {
    socket.emit("typing", username);
  };

  return (
    <div style={{ width: "400px", margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>💬 Real-Time Chat App</h2>

      <div style={{ height: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "10px", backgroundColor: "#fff" }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.username}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {typingUser && <p style={{ fontStyle: "italic" }}>{typingUser} is typing...</p>}

      <div style={{ marginTop: "15px", display: "flex" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleTyping}
          onKeyUp={(e) => e.key === "Enter" && sendMessage()}
          style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: "10px",
            padding: "8px 15px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#4CAF50",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;