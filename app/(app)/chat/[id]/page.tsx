"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatThread } from "@/components/chat/ChatThread";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatIdPage() {
  const params = useParams();
  const id = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [model, setModel] = useState("openai/gpt-4o-mini");
  const [loading, setLoading] = useState(true);
  const [controller, setController] = useState<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/conversations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.conversation) {
          setModel(data.conversation.model || "openai/gpt-4o-mini");
          setMessages(data.messages || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSend = useCallback(
    async (content: string) => {
      const userMsg: Message = { id: `temp-${Date.now()}`, role: "user", content };
      setMessages((prev) => [...prev, userMsg]);

      const abortCtrl = new AbortController();
      setController(abortCtrl);
      setIsStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: id, message: content, model }),
          signal: abortCtrl.signal,
        });

        if (!res.ok) {
        const error = await res.text();
        if (res.status === 403) {
          toast.error("Conversation not found. Redirecting...");
          router.push("/chat");
        } else if (res.status === 429) {
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

        router.refresh();
      } catch (e: any) {
        if (e.name !== "AbortError") {
          toast.error("Failed to send message");
        }
      } finally {
        setIsStreaming(false);
        setController(null);
      }
    },
    [id, model, router]
  );

  const handleStop = () => {
    controller?.abort();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-[#6b7280]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b-2 border-[#0a0a23] bg-white px-4 py-2 flex items-center">
        <ModelSelector value={model} onChange={setModel} />
      </div>
      <ChatThread
        messages={messages}
        onSend={handleSend}
        isStreaming={isStreaming}
        onStop={handleStop}
      />
    </div>
  );
}
