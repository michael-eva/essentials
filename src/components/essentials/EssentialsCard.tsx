import { cn } from "@/lib/utils";

interface EssentialsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "featured" | "warm" | "gradient";
  children: React.ReactNode;
}

export function EssentialsCard({ 
  variant = "default", 
  className, 
  children, 
  ...props 
}: EssentialsCardProps) {
  const variants = {
    default: "bg-card border border-border shadow-warm hover:shadow-warm-lg",
    featured: "bg-gradient-to-br from-brand-amber/10 to-brand-deep-blue/10 border border-brand-sand",
    warm: "bg-gradient-to-br from-brand-warm-brown/5 to-brand-sand/20 border border-brand-sand/50",
    gradient: "bg-gradient-to-br from-brand-neutral-light via-background to-brand-neutral border border-brand-sand/30"
  };

  return (
    <div
      className={cn(
        "p-6 rounded-xl transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
