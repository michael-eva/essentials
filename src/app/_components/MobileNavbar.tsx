"use client"
import { cn } from "@/lib/utils"
import type { NavigationItem } from "../dashboard/layout"
import { useRouter } from "next/navigation"


interface MobileNavbarProps {
  currentTab: string
  navigationItems: NavigationItem[]
}

export default function MobileNavbar({ currentTab, navigationItems }: MobileNavbarProps) {
  const router = useRouter()
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const isActive = currentTab === item.href.split('/').pop()
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
                isActive
                  ? "text-[#007AFF] bg-[#007AFF]/10"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-[#007AFF]" : "text-gray-500"
              )} />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive ? "text-[#007AFF]" : "text-gray-500"
              )}>
                {item.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
