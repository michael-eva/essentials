"use client"

import { motion } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { User, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProfileCompletion } from "@/hooks/useProfileCompletion"
import { CircularProgress } from "@/components/ui/circular-progress"

const ProfileProgress = ({ progress }: { progress?: number }) => {
  const getColor = (progress: number) => {
    if (progress < 30) return "text-red-500"
    if (progress < 70) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <div className="flex items-center gap-1.5 ml-1.5 sm:ml-2">
      <CircularProgress value={progress ?? 0} className="h-4 w-4 sm:h-5 sm:w-5" />
      {progress && progress < 100 && <span className={cn("text-[10px] sm:text-xs font-medium", getColor(progress ?? 0))}>
        {progress ?? 0}%
      </span>}
    </div>
  )
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    showProgress: true,
  },
]

export default function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { totalCompletion } = useProfileCompletion()
  const isLandingPage = pathname.includes("landing")
  if (isLandingPage) {
    return null
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm"
    >
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-semibold text-gray-900">Essentials</span>
        </div>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <motion.button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#007AFF]/10 text-[#007AFF]"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {!item.showProgress && <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                {item.showProgress && <ProfileProgress progress={totalCompletion ?? 0} />}
                <span className="">{item.name}</span>
              </motion.button>
            )
          })}
        </nav>
      </div>
    </motion.header>
  )
} 