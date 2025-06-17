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
    primary: "bg-brand-warm-brown text-white hover:bg-brand-warm-brown-light shadow-warm hover:shadow-warm-lg",
    accent: "bg-brand-amber text-brand-warm-brown-dark hover:bg-brand-amber/90 shadow-warm animate-warm-glow",
    secondary: "bg-brand-sand text-brand-warm-brown-dark hover:bg-brand-sand/80 shadow-warm",
    outline: "border-2 border-brand-warm-brown text-brand-warm-brown hover:bg-brand-warm-brown hover:text-white",
    ghost: "text-brand-warm-brown hover:bg-brand-warm-brown/10 hover:text-brand-warm-brown-dark"
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
