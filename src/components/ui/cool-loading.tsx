"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CoolLoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function CoolLoading({
  size = "md",
  className,
  text = "Loading..."
}: CoolLoadingProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);


  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  // Don't render anything until client-side hydration is complete
  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
        <div className={cn("relative", sizeClasses[size])}>
          <div className="absolute inset-0 rounded-full border-2 border-gray-300" />
        </div>
        <div className={cn("text-center text-gray-500", textSizes[size])}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      {/* The most boring spinner ever */}
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 rounded-full border-2 border-gray-300" />
        <div className="absolute inset-0 rounded-full border-2 border-gray-600 border-t-transparent animate-spin" />
      </div>

      {/* Completely uninspiring text */}
      <div className={cn("text-center text-gray-500 font-normal", textSizes[size])}>
        {text}
      </div>
    </div>
  );
}