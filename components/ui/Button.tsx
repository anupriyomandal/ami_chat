import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-[#0a0a23] text-white hover:bg-white hover:text-[#0a0a23]",
    secondary: "bg-white text-[#0a0a23] hover:bg-[#0a0a23] hover:text-white",
    danger: "bg-[#dc3545] text-white hover:bg-white hover:text-[#dc3545]",
  };

  return (
    <button
      className={cn(
        "border-2 border-[#0a0a23] px-4 py-2 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
