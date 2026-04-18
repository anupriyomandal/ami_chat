"use client";

import { useState } from "react";
import { ChatThread } from "@/components/chat/ChatThread";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const model = "openai/gpt-4o-mini";
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [controller, setController] = useState<AbortController | null>(null);

  const handleSend = async (content: string) => {
    let convId = conversationId;
    if (!convId) {
      try {
        const res = await fetch("/api/conversations", { method: "POST" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        convId = data.id;
        setConversationId(convId);
        // Don't navigate yet — navigating now would unmount this component
        // and kill the in-flight stream. We navigate after streaming completes.
      } catch {
        toast.error("Failed to create conversation");
        return;
      }
    }

    const userMsg: Message = { id: `temp-${Date.now()}`, role: "user", content };
    setMessages((prev) => [...prev, userMsg]);

    const abortCtrl = new AbortController();
    setController(abortCtrl);
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, message: content, model }),
        signal: abortCtrl.signal,
      });

      if (!res.ok) {
        const error = await res.text();
        if (res.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment.");
        } else {
          toast.error(`Error: ${res.status} ${error}`);
        }
        throw new Error(error);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantMsgId = `temp-assistant-${Date.now()}`;

      setMessages((prev) => [...prev, { id: assistantMsgId, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              assistantContent += parsed.content;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsgId ? { ...m, content: assistantContent } : m))
              );
            }
          } catch {}
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast.error("Failed to send message");
      }
    } finally {
      setIsStreaming(false);
      setController(null);
      // Silently update the URL without a full navigation/remount
      if (convId) window.history.replaceState(null, "", `/chat/${convId}`);
    }
  };

  const handleStop = () => {
    controller?.abort();
  };

  return (
    <div className="h-full flex flex-col">
      <ChatThread
        messages={messages}
        onSend={handleSend}
        isStreaming={isStreaming}
        onStop={handleStop}
      />
    </div>
  );
}
