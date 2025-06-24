'use client'
import { usePathname } from "next/navigation"
import MobileNavbar from "../_components/MobileNavbar"
import DesktopNavbar from "../_components/DesktopNavbar"
import {
  Home,
  User,
  Calendar,
  History,
  Dumbbell,
  type LucideIcon,
} from "lucide-react"
export type Tab = "overview" | "your-plan" | "history" | "mypt" | "classes" | "profile"
export type NavigationItem = {
  name: string
  icon: LucideIcon
  href: string
}
const navigationItems = [
  {
    name: "Home",
    icon: Home,
    href: "/dashboard/overview",
  },
  {
    name: "My PT",
    icon: User,
    href: "/dashboard/mypt",
  },
  {
    name: "Your Plan",
    icon: Calendar,
    href: "/dashboard/your-plan",
  },
  {
    name: "History",
    icon: History,
    href: "/dashboard/history",
  },
  {
    name: "Profile",
    icon: Dumbbell,
    href: "/dashboard/profile",
  }
]
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const currentTab = pathname.split('/').pop() ?? 'overview'
  console.log(currentTab)
  return (
    <div className="pb-6 flex flex-col px-4">
      <div className="flex justify-center">
        <img src="/logo/essentials_logo.png" alt="Essentials Studio Logo" className="w-[300px] items-center justify-center md:hidden" />
      </div>
      <DesktopNavbar
        currentTab={currentTab}
        navigationItems={navigationItems}
      />
      <div className="min-h-screen pb-24 md:pt-20 md:pb-8">
        {children}
      </div>
      <div className="md:hidden">
        <MobileNavbar
          currentTab={currentTab}
          navigationItems={navigationItems}
        />
      </div>
    </div>
  )
} 