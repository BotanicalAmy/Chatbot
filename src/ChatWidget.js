import React, { useState } from "react";
import { BedrockClient } from "@aws-sdk/client-bedrock";

export const sidebar = {
  writingMode: "vertical-rl",
  transform: "translateY(-50%) rotate(180deg)",
  backgroundColor: "#4a4354",
  color: "white",
  padding: "4rem 0rem",
  fontSize: ".8rem",
  borderRadius: "0 0.75rem 0.75rem 0",
  cursor: "pointer",
  position: "fixed",
  top: "50%",
  right: "0",
  textAlign: "center",
};

const styles = {
  sidebar,
  chatBox: {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    width: "425px",
    height: "600px",
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    maxWidth: "90%", // Ensure the width does not exceed 90% on smaller screens
  },
  amyGPT: {
    width: "150px", // Adjust the size of the image
    height: "150px",
    margin: "20px auto", // Center the image horizontally
    display: "block",
  },
  welcomeMessage: {
    textAlign: "center",
    fontSize: "16px",
    color: "#282323",
    marginTop: "10px",
    marginBottom: "20px",
  },
  banner: {
    backgroundColor: "#4a4354",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
    padding: "10px",
  },
  bannerText: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: 0,
    textIndent: "10px",
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  messages: {
    display: "flex",
    flexDirection: "column",
    flex: 1, // Allow the messages container to grow and fill available space
    padding: "10px",
    overflowY: "auto", // Enable scrolling for overflowing messages
  },
  userContainer: {
    textAlign: "right",
  },
  botContainer: {
    textAlign: "left",
  },
  user: {
    display: "inline-block",
    position: "relative",
    padding: "10px 15px",
    margin: "5px 0",
    color: "#282c34",
    backgroundColor: "#f7f7f9",
    borderRadius: "15px",
    maxWidth: "80%",
    wordWrap: "break-word",
    textAlign: "right",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  bot: {
    fontFamily: "sans-serif",
    textAlign: "left",
    paddingLeft: "10px",
    margin: "5px 0",
    color: "#282c34",
    maxWidth: "80%",             // keeps long messages from overflowing
    wordWrap: "break-word",      // wraps long words
  },
  avatar: {
    width: "40px",
    height: "40px",
    marginRight: "10px",
    borderRadius: "50%", // round the avatar
  },
  inputArea: {
    display: "flex",
    borderTop: "1px solid #ccc",
    padding: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    resize: "none",
    minHeight: "40px",
  },
  button: {
    marginLeft: "10px",
    padding: "5px 10px",
    backgroundColor: "#6174bc",
    border: "none",
    borderRadius: "5px",
    color: "white",
    cursor: "pointer",
    fontSize: "20px", // font size for arrow to send message
  },
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showImage, setShowImage] = useState(true); // Track whether to show the image

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (showImage) setShowImage(false); // Hide the image after the first message

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      // Initialize AWS Bedrock client
      const client = new BedrockClient({
        region: "us-east-1", // Replace with your AWS region
        credentials: {
          accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID, // Use environment variables
          secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        },
      });

      // Prepare the request to the Bedrock model
      const response = await client.invokeModel({
        modelId: "your-model-id", // Replace with your Bedrock model ID
        body: JSON.stringify({
          inputText: input, // User's input
        }),
        contentType: "application/json",
      });

      // Parse the response
      const botResponse = JSON.parse(response.body).outputText;

      // Add the bot's response to the chat
      const botMessage = { text: botResponse, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error invoking AWS Bedrock model:", error);
      const errorMessage = {
        text: (
          <>
            Sorry, I hit my {" "}
            <a
              href="https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-create.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#6174bc", textDecoration: "underline" }}
            >
              AWS budget threshold
            </a>. <br /> Try again later.
          </>
        ),
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div>
      {/* Sidebar button */}
      {!isOpen && ( // Render the sidebar button only when the chat is closed
        <div onClick={toggleChat} style={styles.sidebar}>
          <h2>Ask Amy</h2>
        </div>
      )}

      {/* Chat widget */}
      {isOpen && (
        <div style={styles.chatBox}>
          {/* Banner */}
          <div style={styles.banner}>
            <p style={styles.bannerText}>Ask Amy</p>
            <button onClick={toggleChat} style={styles.closeButton}>X</button>
          </div>
          {/* Show AmyGPT image and welcome message below the banner */}
          {showImage && (
            <>
              <img
                src="/images/AmyGPT.png" // path for branded AmyGPT image
                alt="AmyGPT"
                style={styles.amyGPT}
              />
              <p style={styles.welcomeMessage}>
                Welcome to my AI Chatbot
              </p>
            </>
          )}
        <div style={styles.messages}>
        {messages.map((msg, i) => (
            <div
            key={i}
            style={msg.sender === "user" ? styles.userContainer : styles.botContainer}
            >
                <div style={msg.sender === "user" ? styles.user : styles.bot}>
                    {msg.sender === "bot" && (
                    <img
                        src="/images/AmyAvatar.jpg"
                        alt="Bot Avatar"
                        style={styles.avatar}
                    />
                    )}
                    {msg.text}
                </div>
            </div>
        ))}
        </div>
          <div style={styles.inputArea}>
            <textarea
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask questions about Amy..."
            />
            <button onClick={sendMessage} style={styles.button}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;