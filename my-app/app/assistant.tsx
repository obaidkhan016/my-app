"use client";

import { useState } from "react";
import { Thread } from "@/components/assistant-ui/thread";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { cn } from "@/lib/utils";

export const Assistant = () => {
  // Example: state for any client-only behavior
  const [dummyState, setDummyState] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background transition-colors duration-300">
        {/* Sidebar with Thread List */}
        <aside className="border-r border-border bg-background/40 backdrop-blur-2xl">
          <ThreadListSidebar />
        </aside>

        {/* Main Chat Area */}
        <SidebarInset className="bg-transparent">
          <header className="flex h-16 shrink-0 items-center justify-center px-6 bg-transparent">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              RGS AI
            </h1>
          </header>

          <div className="flex-1 overflow-hidden px-4 pb-4 md:px-8">
            <div
              className={cn(
                "h-full w-full max-w-5xl mx-auto flex flex-col",
                "bg-background/70 dark:bg-background/50 rounded-[32px] border border-border shadow-lg",
                "transition-all duration-300"
              )}
            >
              {/* Thread / AI Chat Component */}
              <Thread />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
