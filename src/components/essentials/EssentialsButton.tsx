import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EssentialsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function EssentialsButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: EssentialsButtonProps) {
  const baseClasses = "font-medium transition-all duration-200 rounded-lg";

  const variants = {
    primary: "bg-brand-brown text-brand-light-yellow hover:bg-brand-brown/90 shadow-warm hover:shadow-warm-lg cta-primary",
    accent: "bg-brand-cobalt text-brand-white hover:bg-brand-cobalt/90 shadow-warm animate-warm-glow cta-primary",
    secondary: "bg-brand-bright-orange text-brand-brown hover:bg-brand-bright-orange/90 shadow-warm cta-secondary",
    outline: "border-2 border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-brand-light-yellow",
    ghost: "text-brand-brown hover:bg-brand-brown/10 hover:text-brand-brown/80"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
