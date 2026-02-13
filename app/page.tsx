"use client";

import { Assistant } from "./assistant";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col bg-background selection:bg-blue-500/20">
      <div className="flex flex-1 items-stretch overflow-hidden">

        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col relative">

          {/* Subtle Background Circles */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
            <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-purple-500/5 blur-[120px]" />
          </div>

          {/* AI Assistant Component */}
          <div className="flex-1">
            <Assistant />
          </div>

        </div>
      </div>
    </main>
  );
}
