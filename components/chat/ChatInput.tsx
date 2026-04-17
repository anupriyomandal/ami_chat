"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Square } from "lucide-react";
import { Textarea } from "@/components/ui/Textarea";
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
    <div className="border-t-2 border-[#0a0a23] bg-white p-4">
      <div className="max-w-3xl mx-auto flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 min-h-[44px] max-h-[200px]"
          rows={1}
          disabled={disabled || isStreaming}
        />
        {isStreaming ? (
          <button
            onClick={onStop}
            className="h-[44px] px-4 bg-[#dc3545] text-white border-2 border-[#0a0a23] font-semibold text-sm hover:bg-white hover:text-[#dc3545] transition-colors shrink-0"
            aria-label="Stop generating"
          >
            <Square size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            className={cn(
              "h-[44px] px-4 bg-[#0a0a23] text-white border-2 border-[#0a0a23] font-semibold text-sm transition-colors shrink-0",
              "hover:bg-white hover:text-[#0a0a23]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
