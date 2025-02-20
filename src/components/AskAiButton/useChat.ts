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

const CHAT_ENDPOINT = "https://tools.multiversx.com/ai-docs-api/chat";
export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [threadId, setThreadId] = useState<string | undefined>();

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    setError(null);
    console.log({
      message,
      threadId,
    });
    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          threadId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      setThreadId(data.threadId);

      return data;
    } catch (err) {
      console.log("eeeeerrr");
      const error = err as Error;
      setError({ message: error.message });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
    threadId,
  };
};
