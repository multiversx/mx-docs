import React, { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "@theme/CodeBlock"; // Docusaurus built–in CodeBlock
import userAvatar from "@site/static/ask_ai/ask_ai_user_avatar.png";
import assistantAvatar from "@site/static/img/favicons/android-chrome-192x192.png";
import { useChat } from "./useChat";

const ChatWindow = ({ onClose }) => {
  // Initial hardcoded message from the assistant which includes a code snippet.
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([{ role: "assistant", content: "Ask me anything about MultiversX!" }]);
  const [input, setInput] = useState("");

  const { sendMessage, isLoading, error } = useChat();

  // Called when the user hits "Send". Adds a user message then simulates an assistant reply.
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const handleSend = async (message?: string) => {
    console.log("hererere", message, input);
    const msg = message || input;
    if (!msg || isLoading) return;

    // Append the user's message
    const userMessage = { role: "user", content: msg };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    setTimeout(() => {
      chatBodyRef.current?.scrollTo({
        top: chatBodyRef.current.scrollHeight * 10,
        behavior: "smooth",
      });
    }, 200);

    const response = await sendMessage(msg);

    if (!response) return;

    setMessages((prevMessages) => [...prevMessages, response]);

    setTimeout(() => {
      chatBodyRef.current?.scrollTo({
        top: chatBodyRef.current.scrollHeight * 10,
        behavior: "smooth",
      });
    }, 200);
  };

  return (
    <div
      className="chat-modal"
      style={{
        height: "50%",
        backgroundColor: "#171717",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Modal Header */}
      <div
        className="chat-modal-header"
        style={{
          backgroundColor: "#171717",
          color: "#fff",
          padding: "32px 0px 16px",
          margin: "0px 16px",
          borderBottom: "1px solid #333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="chat-modal-title" style={{ fontSize: "18px" }}>
          Ask MultiversX AI
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          &times;
        </button>
      </div>

      {/* Chat Messages Area */}
      <div
        style={{
          height: "60vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div
          className="chat-modal-body"
          ref={chatBodyRef}
          style={{
            padding: "16px 16px 32px",

            overflowY: "auto",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                marginBottom: "15px",
                marginTop: "auto",
              }}
            >
              <div>
                {msg.role === "assistant" ? (
                  <img width="40" src={assistantAvatar} />
                ) : (
                  <img width="40" src={userAvatar} />
                )}
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <CodeBlock language={match[1]}>
                          {String(children).replace(/\n$/, "")}
                        </CodeBlock>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && <div className="animate-pulse"> Thinking...</div>}
        </div>
      </div>

      {/* Input Area */}
      <div
        className="chat-modal-input"
        style={{
          display: "flex",
          position: "relative",
          padding: "0px 16px 32px",
          boxShadow: " 0px -8px 32px 0px rgba(23,23,23,1)",
        }}
      >
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            height: "56px",
            fontSize: "16px",
            flex: 1,
            padding: "16px",
            outline: "none",
            border: "1px solid #333",
            borderRadius: "12px",
            background: "transparent",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="chat-send-button"
          style={{
            padding: "8px 16px",
            fontSize: "16px",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            backgroundColor: "transparent",
            borderRadius: "12px",
            position: "absolute",
            right: "20px",
            bottom: "50%",
            transform: "translateY(calc(50% - 16px))",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
