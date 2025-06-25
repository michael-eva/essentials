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

  // Special handling for My PT page - mobile only
  const isMyPTPage = currentTab === 'mypt'
  return (
    <div className="pb-6 flex flex-col px-4">
      {/* Mobile-only fixed header for My PT */}
      {isMyPTPage && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white">
          <div className="flex justify-center">
            <img src="/logo/essentials_logo.png" alt="Essentials Studio Logo" className="w-[300px]" />
          </div>
        </div>
      )}

      {/* Regular header for all pages (including desktop) */}
      <div className={`flex justify-center ${isMyPTPage ? 'hidden md:flex' : ''}`}>
        <img src="/logo/essentials_logo.png" alt="Essentials Studio Logo" className="w-[300px] items-center justify-center md:hidden" />
      </div>

      <DesktopNavbar
        currentTab={currentTab}
        navigationItems={navigationItems}
      />

      {/* Content area with conditional mobile spacing for My PT */}
      <div className={`min-h-screen pb-24 md:pt-20 md:pb-8 ${isMyPTPage ? 'pt-20 md:pt-0' : ''}`}>
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
