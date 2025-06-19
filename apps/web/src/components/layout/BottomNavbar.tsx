'use client'

import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { Home, Calendar, User, History } from "lucide-react"
import { useProfileCompletion } from "@/hooks/useProfileCompletion"
import { ProfileProgress } from "@/components/ui/profile-progress"

export function BottomNavbar() {
  const pathname = usePathname()
  const currentTab = pathname.split('/').pop() ?? 'overview'
  const { totalCompletion } = useProfileCompletion()

  // Don't show navbar on onboarding pages
  if (pathname.includes('/onboarding')) {
    return null
  }

  const navItems = [
    {
      name: "Home",
      href: "/dashboard/overview",
      icon: Home,
      tab: "overview"
    },
    {
      name: "Your Plan",
      href: "/dashboard/your-plan",
      icon: Calendar,
      tab: "your-plan"
    },
    {
      name: "MyPT",
      href: "/dashboard/mypt",
      icon: User,
      tab: "mypt"
    },
    {
      name: "History",
      href: "/dashboard/history",
      icon: History,
      tab: "history"
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      tab: "profile",
      showProgress: true
    }
  ]

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.tab}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              currentTab === item.tab ? "text-primary" : "text-gray-500"
            )}
          >
            {item.showProgress ? (
              <ProfileProgress progress={totalCompletion ?? 0} />
            ) : (
              <item.icon className="w-6 h-6" />
            )}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </motion.nav>
  )
} 