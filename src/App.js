import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Connect to your deployed backend
const socket = io("https://chatapp-backend-e9z2.onrender.com", {
  transports: ["websocket"],
});

function App() {
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  // On mount: load username from localStorage or prompt once
  useEffect(() => {
    let storedName = localStorage.getItem("username");
    if (!storedName) {
      const name = prompt("Enter your username:");
      if (name) {
        storedName = name.trim();
        localStorage.setItem("username", storedName);
      } else {
        storedName = "Anonymous";
      }
    }
    setUsername(storedName);
    socket.emit("user-joined", storedName);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Socket listeners
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