"use client"

import {
  Home,
  User,
  Calendar,
  History,
  Dumbbell,
  type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

// Define the navigation items
const navigationItems = [
  {
    name: "Home",
    icon: Home,
    component: "home"
  },
  {
    name: "My PT",
    icon: User,
    component: "pt"
  },
  {
    name: "Your Plan",
    icon: Calendar,
    component: "plan"
  },
  {
    name: "History",
    icon: History,
    component: "history"
  },
  {
    name: "Profile",
    icon: Dumbbell,
    component: "profile"
  }
] as const

type ComponentType = typeof navigationItems[number]["component"]

interface DesktopNavbarProps {
  onComponentChange: (component: ComponentType) => void
  activeComponent: ComponentType
}

export default function DesktopNavbar({ onComponentChange, activeComponent }: DesktopNavbarProps) {
  return (
    <div className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Essentials</h1>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-8">
            {navigationItems.map((item) => {
              const isActive = activeComponent === item.component
              return (
                <button
                  key={item.component}
                  onClick={() => onComponentChange(item.component)}
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
          </nav>
        </div>
      </div>
    </div>
  )
} 