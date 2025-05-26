"use client"

import { motion } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { User, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

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
  },
]

export default function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
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
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-gray-900">Essentials</span>
        </div>

        <nav className="flex items-center gap-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <motion.button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#007AFF]/10 text-[#007AFF]"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </motion.button>
            )
          })}
        </nav>
      </div>
    </motion.header>
  )
} 