import { cn } from "@/lib/utils"

interface ProfileProgressProps {
  progress: number
  className?: string
}

export function ProfileProgress({ progress, className }: ProfileProgressProps) {
  const radius = 12
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative w-6 h-6", className)}>
      <svg className="w-6 h-6 transform -rotate-90">
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
          className="text-primary transition-all duration-300 ease-in-out"
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
    </div>
  )
} 