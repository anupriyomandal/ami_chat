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

  if (isUser) {
    return (
      <div className="py-3 px-4 md:px-8 flex justify-end">
        <div className="max-w-[75%] md:max-w-[60%] bg-[#0a0a23] text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 px-4 md:px-8">
      <div className="max-w-3xl mx-auto flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-[#0a0a23] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
          A
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="prose prose-sm max-w-none
            prose-pre:rounded-xl prose-pre:border prose-pre:border-[#e4e4e7] prose-pre:bg-[#f4f4f5]
            prose-code:bg-[#f4f4f5] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
            prose-code:border prose-code:border-[#e4e4e7] prose-code:text-sm
            prose-p:text-[#0a0a23] prose-headings:text-[#0a0a23]">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-[#0a0a23] rounded-sm animate-pulse ml-1" />
            )}
          </div>
          {!isStreaming && content && <CopyButton text={content} />}
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
      className="mt-2 flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#0a0a23] transition-colors rounded-md px-2 py-1 hover:bg-[#f4f4f5]"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
