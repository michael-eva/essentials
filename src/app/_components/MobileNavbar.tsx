"use client"

import { useState } from "react"
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

interface MobileNavbarProps {
  onComponentChange: (component: ComponentType) => void
  activeComponent: ComponentType
}

export default function MobileNavbar({ onComponentChange, activeComponent }: MobileNavbarProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const isActive = activeComponent === item.component
          return (
            <button
              key={item.component}
              onClick={() => onComponentChange(item.component)}
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
