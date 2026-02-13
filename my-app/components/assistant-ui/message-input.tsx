// @ts-nocheck
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Paperclip, Send, Square, MicOff, X, Image, FileText } from "lucide-react";

interface MessageInputProps {
  onSend: (message: string, file?: File) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = React.useState("");
  const [isRecording, setIsRecording] = React.useState(false);
  const [error, setError] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const textareaRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const recognitionRef = React.useRef(null);

  // Initialize speech recognition
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";
        recognitionInstance.maxAlternatives = 1;

        recognitionInstance.onstart = () => {
          setError("");
          setIsRecording(true);
        };

        recognitionInstance.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setMessage(transcript);
          setError("");
        };

        recognitionInstance.onerror = (event) => {
          if (event.error === "no-speech") {
            setError("No speech detected. Click the mic and speak again.");
            return;
          }
          
          if (event.error === "audio-capture") {
            setError("No microphone found. Please check your microphone.");
          } else if (event.error === "not-allowed") {
            setError("Microphone access denied. Please allow microphone access.");
          } else {
            setError(`Speech error: ${event.error}. Please try again.`);
          }
          
          setIsRecording(false);
        };

        recognitionInstance.onend = () => {
          if (isRecording) {
            setIsRecording(false);
          }
        };

        recognitionRef.current = recognitionInstance;
      } else {
        setError("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setError("");
    } else {
      setError("");
      setMessage("");
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        setError("Failed to start speech recognition. Please try again.");
        setIsRecording(false);
      }
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError("File size must be less than 20MB");
        return;
      }
      
      setSelectedFile(file);
      setError("");
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    if (message.trim() || selectedFile) {
      onSend(message, selectedFile || undefined);
      setMessage("");
      handleRemoveFile();
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

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;
    
    if (selectedFile.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (selectedFile.type === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    } else {
      return <Paperclip className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full">
      {/* File Preview */}
      {selectedFile && (
        <div className="px-3 pt-3 pb-1">
          <div className="relative inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border border-border max-w-full">
            {filePreview ? (
              <div className="relative">
                <img 
                  src={filePreview} 
                  alt="Preview" 
                  className="h-12 w-auto rounded object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {getFileIcon()}
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full ml-1"
              onClick={handleRemoveFile}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex items-end gap-2 p-3 bg-background/80 backdrop-blur-sm border-t border-border">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.txt,.doc,.docx"
        />
        
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`h-9 w-9 rounded-full shrink-0 ${selectedFile ? 'text-blue-500' : ''}`}
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
            placeholder={selectedFile ? "Add a message about this file..." : "Message RGS AI..."}
            className="min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0 text-sm"
            rows={1}
            disabled={disabled}
          />
        </div>
        
        {(message.trim() || selectedFile) ? (
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
            variant={isRecording ? "default" : "ghost"}
            className={`h-9 w-9 rounded-full shrink-0 relative ${
              isRecording 
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                : ""
            }`}
            onClick={toggleRecording}
            disabled={disabled || !recognitionRef.current}
          >
            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isRecording && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </Button>
        )}
      </div>
      
      {/* Error message display */}
      {error && (
        <div className="px-3 pb-2 text-xs text-red-500 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
          ⚠️ {error}
        </div>
      )}
      
      {/* Recording indicator */}
      {isRecording && !error && (
        <div className="px-3 pb-2 text-xs text-muted-foreground animate-in fade-in duration-200 flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Listening... Speak now
        </div>
      )}
    </div>
  );
}