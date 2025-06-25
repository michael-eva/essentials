import * as React from "react";
import { cn } from "@/lib/utils";

interface WeekCircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  size?: number; // px
}

export function WeekCircularProgress({
  value = 0,
  size = 32,
  className,
  ...props
}: WeekCircularProgressProps) {
  const radius = 14;
  const stroke = 3;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = Math.max(0, Math.min(100, value));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        className="block"
        width={size}
        height={size}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      >
        <circle
          className="text-gray-200"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className="text-brand-bright-orange"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-gray-700 select-none">
        {Math.round(progress)}%
      </span>
    </div>
  );
} 