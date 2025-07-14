import React, { useRef, useState, useEffect } from "react";
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

  const [streamMessage, setStreamMessage] = useState<
    { role: string; content: string } | undefined
  >(undefined);

  const { sendMessage, isLoading, error, messages: chatMessages } = useChat();

  // Update the messages state as new data arrives
  useEffect(() => {
    setStreamMessage({
      role: "assistant",
      content: chatMessages.map((msg) => msg.content).join(" "),
    });

    chatBodyRef.current?.scrollTo({
      top: chatBodyRef.current.scrollHeight * 10,
      behavior: "smooth",
    });

    if (isLoading) return;

    if (!isLoading && streamMessage) {
      setMessages([...messages, streamMessage]);
      setStreamMessage(undefined);
    }
  }, [isLoading, chatMessages]);

  // Called when the user hits "Send". Adds a user message then simulates an assistant reply.
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const handleSend = async (message?: string) => {
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
      className="chat-modal bg-white dark:bg-neutral-900"
      style={{
        maxWidth: "min(960px, calc(100% - 32px))",
        maxHeight: "min(640px, calc(100% - 32px))",
        height: "100%",
        width: "100%",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Modal Header */}
      <div
        className="chat-modal-header bg-white  dark:bg-neutral-900 text-neutral-900 dark:text-white"
        style={{
          padding: "16px 0px",
          margin: "0px 16px",
          borderBottom: "1px solid #333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          className="chat-modal-title"
          style={{
            fontSize: "18px",
            position: "relative",
            marginRight: "auto",
          }}
        >
          <span>Ask MultiversX AI</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
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
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflow: "auto",
          flex: 1,
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

          {streamMessage && streamMessage.content?.length > 0 && (
            <div
              style={{
                marginBottom: "15px",
                marginTop: "auto",
              }}
            >
              <div>
                <img width="40" src={assistantAvatar} />
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
                  {streamMessage.content}
                </ReactMarkdown>
              </div>
            </div>
          )}
          {isLoading && <div className="animate-pulse"> Thinking...</div>}
        </div>
      </div>

      {/* Input Area */}
      <div
        className="chat-modal-input"
        style={{
          display: "flex",
          position: "relative",
          padding: "0px 16px 16px",
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
            paddingRight: 64,
            background: "transparent",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading}
          className="chat-send-button"
          style={{
            padding: "8px 16px",
            fontSize: "16px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "transparent",
            borderRadius: "12px",
            position: "absolute",
            right: "20px",
            bottom: "50%",
            transform: "translateY(calc(50% - 8px))",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
