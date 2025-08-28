"use client"
import { cn } from "@/lib/utils"
import type { NavigationItem } from "@/app/dashboard/layout"
import { useRouter } from "next/navigation"
import { api } from "@/trpc/react"
import { Settings } from "lucide-react"



interface DesktopNavbarProps {
  currentTab: string
  navigationItems: NavigationItem[]
}

export default function DesktopNavbar({ navigationItems, currentTab }: DesktopNavbarProps) {
  const router = useRouter()
  const { data: user } = api.user.getUser.useQuery()
  
  return (
    <div className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <img src="/logo/essentials_pt_logo.png" alt="Essentials Studio Logo" className="w-[300px] items-center justify-center" />
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-8">
            {navigationItems.map((item) => {
              const isActive = currentTab === item.href.split('/').pop()
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-[#007AFF] bg-[#007AFF]/10"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-[#007AFF]" : "text-gray-500"
                  )} />
                  <span className="transition-colors">
                    {item.name}
                  </span>
                </button>
              )
            })}
            
            {/* Admin Button - Only show if user is admin */}
            {user?.role === "admin" && (
              <button
                onClick={() => router.push("/admin")}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                )}
              >
                <Settings className="h-4 w-4 transition-colors text-gray-500" />
                <span className="transition-colors">Admin</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  )
} 