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
  const [rotation, setRotation] = useState(0);
  const [morph, setMorph] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {


    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 2) % 360);
    }, 50);

    const morphInterval = setInterval(() => {
      setMorph(prev => (prev + 0.02) % (2 * Math.PI));
    }, 50);

    const pulseInterval = setInterval(() => {
      setPulse(prev => (prev + 0.1) % (2 * Math.PI));
    }, 50);

    return () => {
      clearInterval(rotationInterval);
      clearInterval(morphInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  // Don't render anything until client-side hydration is complete
  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
        <div className={cn("relative", sizeClasses[size])}>
          <div className="absolute inset-0 rounded-full border-4 border-gray-300 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-gray-200 animate-pulse" />
        </div>
        <div className={cn("text-center text-gray-500", textSizes[size])}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      {/* Main animated container */}
      <div className={cn("relative", sizeClasses[size])}>
        {/* Outer rotating ring with glow */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            background: `conic-gradient(from ${rotation}deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #10b981, #3b82f6)`,
            filter: "blur(1px)",
            animation: "spin 3s linear infinite"
          }}
        />

        {/* Inner morphing shape */}
        <div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
          style={{
            clipPath: `polygon(${50 + 30 * Math.cos(morph)}% ${50 + 30 * Math.sin(morph)}%, ${50 + 30 * Math.cos(morph + Math.PI / 2)}% ${50 + 30 * Math.sin(morph + Math.PI / 2)}%, ${50 + 30 * Math.cos(morph + Math.PI)}% ${50 + 30 * Math.sin(morph + Math.PI)}%, ${50 + 30 * Math.cos(morph + 3 * Math.PI / 2)}% ${50 + 30 * Math.sin(morph + 3 * Math.PI / 2)}%)`,
            filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))"
          }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
            style={{
              left: `${50 + 35 * Math.cos(rotation * 0.1 + i * Math.PI / 3)}%`,
              top: `${50 + 35 * Math.sin(rotation * 0.1 + i * Math.PI / 3)}%`,
              animationDelay: `${i * 0.2}s`,
              filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))"
            }}
          />
        ))}

        {/* Pulsing center dot */}
        <div
          className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            boxShadow: `0 0 ${20 + 15 * Math.sin(pulse)}px rgba(255, 255, 255, 0.8)`,
            filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.6))"
          }}
        />

        {/* Energy waves */}
        <div
          className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-30"
          style={{
            animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
            animationDelay: "0s"
          }}
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-purple-400 opacity-30"
          style={{
            animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
            animationDelay: "0.5s"
          }}
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-pink-400 opacity-30"
          style={{
            animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
            animationDelay: "1s"
          }}
        />
      </div>

      {/* Animated text */}
      <div className={cn("text-center", textSizes[size])}>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0s" }}>L</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.1s" }}>o</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.2s" }}>a</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.3s" }}>d</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.4s" }}>i</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.5s" }}>n</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.6s" }}>g</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.7s" }}>.</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.8s" }}>.</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.9s" }}>.</span>
      </div>

      {/* Progress bar */}
      {/* <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
          style={{
            width: `${(Math.sin(pulse) + 1) * 50}%`,
            transition: "width 0.3s ease-in-out"
          }}
        />
      </div> */}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
