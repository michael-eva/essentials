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
    featured: "bg-gradient-to-br from-brand-bright-orange/10 to-brand-cobalt/10 border border-brand-nude",
    warm: "bg-gradient-to-br from-brand-brown/5 to-brand-nude/20 border border-brand-nude/50",
    gradient: "bg-gradient-to-br from-brand-light-yellow via-background to-brand-nude border border-brand-nude/30"
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
