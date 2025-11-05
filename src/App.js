import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://chatapp-backend-e9z2.onrender.com", {
  transports: ["websocket"],
});

let savedUsername = localStorage.getItem("username");
if (!savedUsername) savedUsername = ""; // fallback

function App() {
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  // Prompt only if username is not in localStorage
  useEffect(() => {
    if (!username) {
      const name = prompt("Enter your username:") || "Anonymous";
      setUsername(name);
      localStorage.setItem("username", name);
      socket.emit("user-joined", name);
    } else {
      socket.emit("user-joined", username);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.on("chat-message", (data) => setMessages((prev) => [...prev, data]));
    socket.on("user-joined", (user) =>
      setMessages((prev) => [...prev, { username: "System", text: `${user} joined the chat` }])
    );
    socket.on("user-left", (user) =>
      setMessages((prev) => [...prev, { username: "System", text: `${user} left the chat` }])
    );
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

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { username, text: input };
    socket.emit("send-message", msg);
    setInput(""); // only clear input, don’t update messages here
  };

  const handleTyping = () => socket.emit("typing", username);

  if (!username) return null; // don’t render anything until username exists

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>💬 Real-Time Chat App</h2>

      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: "10px",
              fontWeight: msg.username === "System" ? "bold" : "normal",
              color: msg.username === username ? "#4CAF50" : "#000",
            }}
          >
            <strong>{msg.username}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {typingUser && <p style={styles.typing}>{typingUser} is typing...</p>}

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleTyping}
          onKeyUp={(e) => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "2px solid #ddd",
    borderRadius: "10px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  chatBox: {
    height: "300px",
    overflowY: "auto",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
    backgroundColor: "#fff",
  },
  typing: {
    color: "#555",
    fontStyle: "italic",
    marginTop: "5px",
  },
  inputContainer: {
    display: "flex",
    marginTop: "15px",
  },
  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    marginLeft: "10px",
    padding: "8px 15px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
  },
};

export default App;