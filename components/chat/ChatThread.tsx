"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatThreadProps {
  messages: Message[];
  onSend: (message: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  disabled?: boolean;
}

export function ChatThread({ messages, onSend, isStreaming, onStop, disabled }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#f7f7f8]">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#0a0a23] text-white flex items-center justify-center text-xl font-black mx-auto">A</div>
              <h2 className="text-2xl font-bold text-[#0a0a23]">AMIChat</h2>
              <p className="text-[#71717a] text-sm">Start a conversation with AI</p>
            </div>
          </div>
        ) : (
          <>
            <div className="pt-6 pb-2">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isStreaming && msg === messages[messages.length - 1] && msg.role === "assistant"}
                />
              ))}
            </div>
            <div ref={bottomRef} />
          </>
        )}
      </div>
      <ChatInput onSend={onSend} isStreaming={isStreaming} onStop={onStop} disabled={disabled} />
    </div>
  );
}
