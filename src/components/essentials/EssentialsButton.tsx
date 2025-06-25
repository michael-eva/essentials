import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EssentialsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  bg?: string;
  textColor?: string;
  children: React.ReactNode;
}

export function EssentialsButton({
  variant = "primary",
  size = "md",
  bg,
  textColor,
  className,
  children,
  ...props
}: EssentialsButtonProps) {
  const baseClasses = "font-medium transition-all duration-200 rounded-lg";

  const variants = {
    // primary: "bg-brand-brown text-brand-light-yellow hover:bg-brand-brown/90 shadow-warm hover:shadow-warm-lg cta-primary",
    accent: "bg-brand-cobalt text-brand-white hover:bg-brand-cobalt/90 shadow-warm animate-warm-glow",
    primary: "bg-brand-bright-orange text-brand-white hover:bg-brand-bright-orange/90 shadow-warm",
    outline: "border border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-brand-brown/80",
    ghost: "text-brand-brown hover:bg-brand-brown/10 hover:text-brand-brown/80"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  // Custom styling override
  const customStyles = bg || textColor ? {
    backgroundColor: bg,
    color: textColor,
  } : {};

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      style={customStyles}
      {...props}
    >
      {children}
    </button>
  );
}
