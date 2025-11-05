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

  useEffect(() => {
    // ✅ Get username from localStorage or ask user
    let name = localStorage.getItem("username");
    if (!name) {
      name = prompt("Enter your username:");
      if (name) {
        localStorage.setItem("username", name);
      }
    }
    setUsername(name);
    socket.emit("user-joined", name);

    // ✅ Receive previous messages (persistence)
    socket.on("previous-messages", (msgs) => {
      setMessages(msgs.map((msg) => ({ username: msg.username, text: msg.text })));
    });

    // ✅ Receive new messages
    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // ✅ User joined/left notifications
    socket.on("user-joined", (user) => {
      setMessages((prev) => [...prev, { username: "System", text: `${user} joined the chat` }]);
    });
    socket.on("user-left", (user) => {
      setMessages((prev) => [...prev, { username: "System", text: `${user} left the chat` }]);
    });

    // ✅ Typing indicator
    socket.on("typing", (user) => {
      if (user !== username) {
        setTypingUser(user);
        setTimeout(() => setTypingUser(""), 2000);
      }
    });

    // ✅ Cleanup on unmount
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
      socket.emit("send-message", msg); // backend broadcasts it
      setInput(""); // clear input
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