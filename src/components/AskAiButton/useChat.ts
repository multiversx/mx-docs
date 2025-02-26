import { useState } from "react";

interface ChatResponse {
  role: string;
  content: string;
  threadId: string;
}

interface ChatError {
  message: string;
  status?: number;
}

const STREAM_ENDPOINT = "http://localhost:3005/ai-docs-api/chat/stream";

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [threadId, setThreadId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatResponse[]>([]);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(STREAM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message,
          threadId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      let accumulatedContent = "";

      while (true) {
        const { done, value } = (await reader?.read()) || {};
        if (done) break;

        let chunk = decoder.decode(value, { stream: true });

        console.log(chunk);
        try {
          const { threadId } = JSON.parse(chunk);
          setThreadId(threadId);
          chunk = "";
        } catch {}
        accumulatedContent += chunk;

        // Update the last message with the new content
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          const updatedMessage = {
            ...lastMessage,
            content: accumulatedContent,
          };
          return [...prevMessages.slice(0, -1), updatedMessage];
        });

        // If the response is complete, close the stream
        if (chunk.includes("done")) {
          break;
        }
      }
    } catch (err) {
      const error = err as Error;
      setError({ message: error.message });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      });
      setTimeout(() => {
        setMessages([]);
      });
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
    messages,
    threadId,
  };
};
