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

  // Handle username input
  const joinChat = (name) => {
    if (name.trim()) {
      setUsername(name);
      socket.emit("user-joined", name);
    }
  };

  useEffect(() => {
    if (!username) return;

    // Load previous messages
    socket.on("previous-messages", (msgs) => {
      setMessages(msgs.map((msg) => ({ username: msg.username, text: msg.text })));
    });

    // New messages
    socket.on("chat-message", (data) => setMessages((prev) => [...prev, data]));

    // User joined
    socket.on("user-joined", (user) =>
      setMessages((prev) => [...prev, { username: "System", text: `${user} joined the chat` }])
    );

    // User left
    socket.on("user-left", (user) =>
      setMessages((prev) => [...prev, { username: "System", text: `${user} left the chat` }])
    );

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

  const sendMessage = () => {
    if (input.trim()) {
      const data = { username, text: input };
      socket.emit("send-message", data);
      setMessages((prev) => [...prev, data]);
      setInput("");
    }
  };

  const handleTyping = () => socket.emit("typing", username);

  return (
    <div style={{ width: "400px", margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      {!username ? (
        <div>
          <h2>Enter your username</h2>
          <input
            type="text"
            onKeyDown={(e) => e.key === "Enter" && joinChat(e.target.value)}
            placeholder="Type your name..."
          />
          <button onClick={() => joinChat(document.querySelector("input").value)}>Join Chat</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {username} 👋</h2>
          <div style={{ height: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
            {messages.map((msg, i) => (
              <div key={i}>
                <strong>{msg.username}:</strong> {msg.text}
              </div>
            ))}
          </div>
          {typingUser && <p>{typingUser} is typing...</p>}
          <div style={{ display: "flex", marginTop: "10px" }}>
            <input
              style={{ flex: 1, padding: "8px" }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                handleTyping();
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;