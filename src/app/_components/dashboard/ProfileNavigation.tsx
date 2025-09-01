"use client";

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, User, Settings, Smartphone, AlertTriangle, Camera } from "lucide-react"
import { motion } from "framer-motion"
import { useSession } from "@/contexts/SessionContext"
import { toast } from "sonner"
import Link from "next/link"

const profileSections = [
  // {
  //   id: "account",
  //   title: "Account Information",
  //   description: "Update your personal details and contact information",
  //   icon: <User className="h-6 w-6" />,
  //   color: "#3B82F6",
  //   href: "/dashboard/profile/account"
  // },
  {
    id: "progress-photos",
    title: "Progress Photos",
    description: "Capture and view your fitness progress over time",
    icon: <Camera className="h-6 w-6" />,
    color: "#F59E0B",
    href: "/dashboard/profile/progress-photos"
  },
  {
    id: "settings",
    title: "Profile Settings",
    description: "Complete your profile sections and preferences",
    icon: <Settings className="h-6 w-6" />,
    color: "#10B981",
    href: "/dashboard/profile/settings"
  },
  {
    id: "app",
    title: "App Settings",
    description: "Configure notifications and app preferences",
    icon: <Smartphone className="h-6 w-6" />,
    color: "#8B5CF6",
    href: "/dashboard/profile/app"
  },
  {
    id: "danger",
    title: "Danger Zone",
    description: "Permanently delete all your data",
    icon: <AlertTriangle className="h-6 w-6" />,
    color: "#EF4444",
    href: "/dashboard/profile/danger"
  }
]

export default function ProfileNavigation() {
  const { signOut } = useSession()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Failed to log out. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:border-red-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {profileSections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={section.href}>
              <Card className="hover:border-brand-brown cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md group">
                <div className="flex items-start space-x-4">
                  <div
                    className="rounded-lg p-3 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `${section.color}20` }}
                  >
                    <div style={{ color: section.color }}>{section.icon}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-brand-brown transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}