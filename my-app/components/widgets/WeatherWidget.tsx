import * as React from "react";
import { MessageInput } from "@/components/assistant-ui/message-input";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export const Thread = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams?.get("chat");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages
  useEffect(() => {
    if (chatId) {
      const savedMessages = localStorage.getItem(`chat-${chatId}`);
      if (savedMessages) setMessages(JSON.parse(savedMessages));
      else setMessages([]);
    } else {
      const newChatId = `chat-${Date.now()}`;
      router.push(`/?chat=${newChatId}`);
    }
  }, [chatId, router]);

  // Save messages
  useEffect(() => {
    if (!chatId) return;
    const chats = JSON.parse(localStorage.getItem("rgs-chats") || "[]");
    const existingChat = chats.find((c: any) => c.id === chatId);

    if (messages.length > 0) {
      localStorage.setItem(`chat-${chatId}`, JSON.stringify(messages));
      if (existingChat) {
        existingChat.messages = messages;
        existingChat.timestamp = Date.now();
        existingChat.title = generateTitle(messages);
      } else {
        chats.push({
          id: chatId,
          title: generateTitle(messages),
          timestamp: Date.now(),
          messages: messages,
        });
      }
      localStorage.setItem("rgs-chats", JSON.stringify(chats));
    } else {
      const filteredChats = chats.filter((c: any) => c.id !== chatId);
      localStorage.setItem("rgs-chats", JSON.stringify(filteredChats));
    }
  }, [messages, chatId]);

  const generateTitle = (msgs: ChatMessage[]) => {
    const firstUserMsg = msgs.find((m) => m.role === "user");
    if (firstUserMsg) {
      return firstUserMsg.content.split(" ").slice(0, 5).join(" ") + "...";
    }
    return "New Chat";
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content }],
          system: "You are a helpful AI assistant named RGS AI. Keep responses concise and helpful.",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error || "API error");

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.response,
          timestamp: Date.now(),
        },
      ]);
    } catch (error: any) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: error.message || "Sorry, I encountered an error. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!chatId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Creating new chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-background">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-2xl px-4 py-2.5">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700">
        <MessageInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default Thread;
