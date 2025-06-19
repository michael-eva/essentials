import { cn } from "@/lib/utils"
import { User } from "lucide-react"

interface ProfileProgressProps {
  progress: number
  className?: string
}

export function ProfileProgress({ progress, className }: ProfileProgressProps) {
  const radius = 12
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const progressColor = progress >= 90
    ? "text-green-500"
    : progress >= 50
      ? "text-blue-500"
      : "text-gray-500"

  return (
    <div className={cn("relative w-6 h-6", className)}>
      <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
        {/* Background circle */}
        <circle
          className="text-gray-200"
          strokeWidth="2"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="12"
          cy="12"
        />
        {/* Progress circle */}
        <circle
          className={cn("transition-all duration-300 ease-in-out", progressColor)}
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="12"
          cy="12"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <User className="w-3 h-3" />
      </div>
    </div>
  )
} 