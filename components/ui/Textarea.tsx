import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full border-2 border-[#0a0a23] px-3 py-2 bg-white text-[#0a0a23] placeholder:text-[#6b7280] text-sm resize-none",
        "focus:outline-none focus:ring-2 focus:ring-[#0a0a23] focus:ring-offset-2",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
