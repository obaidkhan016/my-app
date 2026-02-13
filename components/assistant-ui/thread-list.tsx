import * as React from "react";
import { MessagesSquare, MoreHorizontal, Edit, Trash2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";

interface Chat {
  id: string;
  title: string;
  timestamp: number;
  messages: any[];
}

export function ThreadList() {
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(null);
  const [newTitle, setNewTitle] = React.useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = searchParams?.get("chat");

  // Load chats from localStorage
  const loadChats = React.useCallback(() => {
    const savedChats = localStorage.getItem("rgs-chats");
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        // Filter out empty chats (no messages)
        const validChats = parsedChats.filter((chat: Chat) => 
          chat.messages && chat.messages.length > 0
        );
        setChats(validChats);
        console.log("📋 Loaded chats:", validChats.length);
      } catch (e) {
        console.error("Failed to parse chats", e);
        setChats([]);
      }
    } else {
      setChats([]);
    }
  }, []);
  
  // Initial load and event listeners
  React.useEffect(() => {
    loadChats();
    
    // Listen for storage events (other tabs)
    window.addEventListener("storage", loadChats);
    
    // Listen for custom event (same tab)
    window.addEventListener("chatsUpdated", loadChats);
    
    // Also listen for focus events (user returning to tab)
    window.addEventListener("focus", loadChats);
    
    return () => {
      window.removeEventListener("storage", loadChats);
      window.removeEventListener("chatsUpdated", loadChats);
      window.removeEventListener("focus", loadChats);
    };
  }, [loadChats]);

  const handleSelectChat = (chatId: string) => {
    router.push(`/?chat=${chatId}`);
  };

  const handleRename = (chatId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    const updatedChats = chats.map((chat) =>
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    );
    setChats(updatedChats);
    localStorage.setItem("rgs-chats", JSON.stringify(updatedChats));
    window.dispatchEvent(new Event("chatsUpdated"));
    setIsRenameDialogOpen(false);
    setNewTitle("");
    setSelectedChatId(null);
  };

  const handleDelete = (chatId: string) => {
    // Remove from chats list
    const updatedChats = chats.filter((chat) => chat.id !== chatId);
    setChats(updatedChats);
    localStorage.setItem("rgs-chats", JSON.stringify(updatedChats));
    
    // Remove chat messages
    localStorage.removeItem(`chat-${chatId}`);
    
    window.dispatchEvent(new Event("chatsUpdated"));
    
    // If current chat is deleted, create new one
    if (currentChatId === chatId) {
      const newChatId = `chat-${Date.now()}`;
      router.push(`/?chat=${newChatId}`);
    }
  };

  const handleArchive = (chatId: string) => {
    handleDelete(chatId);
  };

  // Sort by newest first
  const sortedChats = [...chats].sort((a, b) => b.timestamp - a.timestamp);

  if (sortedChats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <MessagesSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No chat history yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Start a new conversation</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {sortedChats.map((chat) => (
          <ThreadItem
            key={chat.id}
            id={chat.id}
            title={chat.title || "New Chat"}
            isActive={currentChatId === chat.id}
            onSelect={() => handleSelectChat(chat.id)}
            onRename={() => {
              setSelectedChatId(chat.id);
              setNewTitle(chat.title || "New Chat");
              setIsRenameDialogOpen(true);
            }}
            onDelete={() => handleDelete(chat.id)}
            onArchive={() => handleArchive(chat.id)}
          />
        ))}
      </div>
      
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new name"
              className="w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && selectedChatId) {
                  handleRename(selectedChatId, newTitle);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedChatId && handleRename(selectedChatId, newTitle)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ThreadItemProps {
  id: string;
  title: string;
  isActive?: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

function ThreadItem({
  id,
  title,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onArchive,
}: ThreadItemProps) {
  return (
    <div
      className={`group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted cursor-pointer transition-colors ${
        isActive ? "bg-muted/80" : ""
      }`}
      onClick={onSelect}
    >
      <span className="truncate flex-1 text-foreground/90">{title}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }}>
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}