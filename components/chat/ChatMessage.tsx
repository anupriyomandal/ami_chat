import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  if (role === "system") return null;

  const isUser = role === "user";

  return (
    <div className={cn("py-4 px-4 md:px-8", isUser ? "bg-[#f5f5f5]" : "bg-white")}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-8 h-8 border-2 border-[#0a0a23] flex items-center justify-center text-sm font-bold shrink-0",
              isUser ? "bg-[#0a0a23] text-white" : "bg-white text-[#0a0a23]"
            )}
          >
            {isUser ? "U" : "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold mb-1">{isUser ? "You" : "Assistant"}</div>
            <div className="prose prose-sm max-w-none prose-pre:border-2 prose-pre:border-[#0a0a23] prose-pre:bg-[#f5f5f5] prose-code:bg-[#f5f5f5] prose-code:px-1 prose-code:py-0.5 prose-code:border prose-code:border-[#0a0a23] prose-code:text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {content}
              </ReactMarkdown>
              {isStreaming && <span className="inline-block w-2 h-4 bg-[#0a0a23] animate-pulse ml-1" />}
            </div>
            {!isUser && content && !isStreaming && (
              <CopyButton text={content} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-2 flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#0a0a23] transition-colors"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
