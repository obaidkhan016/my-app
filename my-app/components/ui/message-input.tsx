// @ts-nocheck
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Paperclip, Send, Square } from "lucide-react";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = React.useState("");
  const [isRecording, setIsRecording] = React.useState(false);
  const textareaRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const recognitionRef = React.useRef(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setMessage((prev) => prev + (prev ? " " : "") + transcript);
          setIsRecording(false);
        };

        recognitionInstance.onerror = () => {
          setIsRecording(false);
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognitionInstance;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Speech recognition error:", error);
        setIsRecording(false);
      }
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="relative flex items-end gap-2 bg-background/80 backdrop-blur-sm border rounded-2xl p-2 shadow-sm">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-9 w-9 rounded-full shrink-0"
        onClick={handleFileClick}
        disabled={disabled}
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Message RGS AI..."
          className="min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
          rows={1}
          disabled={disabled}
        />
      </div>
      {message.trim() ? (
        <Button
          type="button"
          size="icon"
          className="h-9 w-9 rounded-full shrink-0 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
          onClick={handleSend}
          disabled={disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          size="icon"
          variant={isRecording ? "destructive" : "ghost"}
          className={`h-9 w-9 rounded-full shrink-0 ${
            isRecording ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : ""
          }`}
          onClick={toggleRecording}
          disabled={!recognitionRef.current || disabled}
        >
          {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}