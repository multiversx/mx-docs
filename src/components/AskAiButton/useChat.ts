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
      const response = await fetch(
        // "https://kv0txnlt-3005.euw.devtunnels.ms/ai-docs-api/chat",
        "https://tools.multiversx.com/ai-docs-api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            threadId,
          }),
        }
      );

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
