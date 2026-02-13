import * as React from "react";
import { MessagesSquare, Plus, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ThreadListSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    router.push(`/?chat=${newChatId}`);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
              <MessagesSquare className="size-4" />
            </div>
            <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              RGS AI
            </span>
          </div>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </SidebarHeader>
      <div className="px-3 py-3">
        <Button
          className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600"
          onClick={handleNewChat}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      <SidebarContent className="px-2">
        <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
          Recent Chats
        </div>
        <ThreadList />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}