import * as React from "react";
import { MessageInput } from "@/components/assistant-ui/message-input";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MessagesSquare, FileText, Paperclip } from "lucide-react";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  file?: {
    name: string;
    type: string;
    preview?: string;
  };
}

interface Chat {
  id: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
}

export const Thread = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams?.get("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");

  // Load messages for current chat
  useEffect(() => {
    if (chatId) {
      const savedMessages = localStorage.getItem(`chat-${chatId}`);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed);
        } catch (e) {
          console.error("Failed to parse messages", e);
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } else {
      const newChatId = `chat-${Date.now()}`;
      router.push(`/?chat=${newChatId}`);
    }
  }, [chatId, router]);

  // Generate smart title based on conversation
  const generateSmartTitle = (msgs: ChatMessage[]): string => {
    if (msgs.length === 0) return "New Chat";

    const userMessages = msgs.filter(m => m.role === "user");
    if (userMessages.length === 0) return "New Chat";

    for (const msg of userMessages) {
      const content = msg.content.trim();
      if (!content) continue;

      const lower = content.toLowerCase();
      const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "good night"];
      if (greetings.includes(lower)) return "Hi";

      if (content.includes("?")) {
        const question = content.split("?")[0] + "?";
        return question.length > 40 ? question.slice(0, 37) + "..." : question;
      }

      const keywords = ["what", "how", "why", "when", "where", "who", "which", "can", "would", "should", "will", "explain", "create", "build", "code"];
      const firstWord = content.split(" ")[0].toLowerCase();
      if (keywords.includes(firstWord)) {
        const words = content.split(" ").slice(0, 5).join(" ");
        return words.length > 40 ? words.slice(0, 37) + "..." : words;
      }

      if (msg.file) {
        return msg.file.name.length > 20 ? msg.file.name.slice(0, 17) + "..." : msg.file.name;
      }

      const words = content.split(" ").slice(0, 5).join(" ");
      return words.length > 40 ? words.slice(0, 37) + "..." : words;
    }

    return "New Chat";
  };

  // Update localStorage and chat title whenever messages change
  useEffect(() => {
    if (!chatId) return;

    localStorage.setItem(`chat-${chatId}`, JSON.stringify(messages));

    const chats = JSON.parse(localStorage.getItem("rgs-chats") || "[]");
    const existingIndex = chats.findIndex((c: Chat) => c.id === chatId);

    const title = generateSmartTitle(messages);

    const chatData: Chat = {
      id: chatId,
      title,
      timestamp: Date.now(),
      messages,
    };

    if (existingIndex !== -1) {
      chats[existingIndex] = chatData;
    } else {
      chats.push(chatData);
    }

    localStorage.setItem("rgs-chats", JSON.stringify(chats));
    window.dispatchEvent(new Event("chatsUpdated"));
  }, [messages, chatId]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      messages.forEach(msg => {
        if (msg.file?.preview && msg.file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(msg.file.preview);
        }
      });
    };
  }, [messages]);

  const handleSendMessage = async (content: string, file?: File) => {
    let previewUrl: string | undefined = undefined;
    if (file?.type.startsWith('image/')) previewUrl = URL.createObjectURL(file);

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: content || (file ? `📎 Sent: ${file.name}` : ""),
      timestamp: Date.now(),
      file: file ? { name: file.name, type: file.type, preview: previewUrl } : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingMessage("");

    try {
      const formData = new FormData();
      formData.append("message", content || "");
      if (file) formData.append("file", file);

      const response = await fetch("/api/chat", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) throw new Error(data.details || data.error || "API error");

      const fullText = data.response;
      const words = fullText.split(' ');
      let currentText = '';

      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 40));
        currentText += (i === 0 ? '' : ' ') + words[i];
        setStreamingMessage(currentText);
      }

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: fullText,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage("");

    } catch (error: any) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Sorry, I encountered an error. Please try again.", timestamp: Date.now() },
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

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-2xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
              <MessagesSquare className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            RGS AI
          </h1>
          <p className="text-muted-foreground text-lg">How can I help you today?</p>
          <p className="text-xs text-muted-foreground">Upload images, PDFs, or text files for analysis</p>
        </div>
        <div className="absolute bottom-24 left-0 right-0 px-4 max-w-3xl mx-auto">
          <MessageInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.role === "user" ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white" : "bg-muted text-foreground"}`}>
                {msg.file && (
                  <div className="mb-2">
                    {msg.file.preview ? (
                      <div className="rounded-lg overflow-hidden border border-white/20 bg-black/5 dark:bg-white/5">
                        <img src={msg.file.preview} alt={msg.file.name} className="max-w-full h-auto max-h-48 object-contain" loading="lazy" />
                        <div className="px-2 py-1 text-xs text-white/80 bg-black/50 truncate">{msg.file.name}</div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                        {msg.file.type === 'application/pdf' ? <FileText className="h-4 w-4 flex-shrink-0" /> : <Paperclip className="h-4 w-4 flex-shrink-0" />}
                        <span className="truncate max-w-[200px]">{msg.file.name}</span>
                      </div>
                    )}
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
            </div>
          ))}

          {streamingMessage && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-muted text-foreground rounded-2xl px-4 py-2.5">
                <p className="whitespace-pre-wrap break-words">{streamingMessage}</p>
                <span className="inline-block w-0.5 h-4 ml-0.5 bg-foreground/70 animate-pulse" />
              </div>
            </div>
          )}

          {isLoading && !streamingMessage && (
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
      </div>
      <div className="border-t border-border">
        <div className="max-w-3xl mx-auto">
          <MessageInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Thread;
