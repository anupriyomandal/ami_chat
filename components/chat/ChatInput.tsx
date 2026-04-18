"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, isStreaming, onStop, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  const handleSubmit = () => {
    if (!value.trim() || isStreaming || disabled) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 py-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2 bg-white rounded-2xl border border-[#e4e4e7] shadow-sm px-4 py-3 focus-within:border-[#a1a1aa] transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 min-h-[24px] max-h-[200px] resize-none bg-transparent text-sm text-[#0a0a23] placeholder:text-[#a1a1aa] outline-none leading-relaxed"
            rows={1}
            disabled={disabled || isStreaming}
          />
          {isStreaming ? (
            <button
              onClick={onStop}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#0a0a23] text-white hover:bg-[#1a1a3a] transition-colors shrink-0"
              aria-label="Stop generating"
            >
              <Square size={14} fill="white" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || disabled}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-lg transition-colors shrink-0",
                value.trim() && !disabled
                  ? "bg-[#0a0a23] text-white hover:bg-[#1a1a3a]"
                  : "bg-[#e4e4e7] text-[#a1a1aa] cursor-not-allowed"
              )}
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          )}
        </div>
        <p className="text-center text-xs text-[#a1a1aa] mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
