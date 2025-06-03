import * as React from "react"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

export function CircularProgress({
  value = 0,
  className,
  ...props
}: CircularProgressProps) {
  const radius = 8
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} {...props}>
      <svg
        className="transform -rotate-90"
        width="100%"
        height="100%"
        viewBox="0 0 20 20"
      >
        <circle
          className="text-gray-200"
          strokeWidth="2"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="10"
          cy="10"
        />
        <circle
          className="text-[#007AFF]"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="10"
          cy="10"
        />
      </svg>
      <User className="absolute h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-600" />
    </div>
  )
} 