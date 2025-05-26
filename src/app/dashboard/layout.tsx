'use client'
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import AppLayout from "../_components/common/DashboardLayout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const currentTab = pathname.split('/').pop() ?? 'overview'
  const isLandingPage = pathname.includes("landing")

  return (
    <AppLayout>
      <div className="container max-w-md mx-auto pb-6 md:max-w-2xl">
        {!isLandingPage && <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="shadow-lg overflow-hidden bg-white mb-6"
        >
          <div className="px-6 pt-6 pb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Health Tracker</h2>
            </div>
            <div className="shadow-sm bg-background inline-flex h-10 items-center justify-center rounded-md p-1 text-muted-foreground w-full">
              <Link
                href={`/dashboard/overview`}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  currentTab === 'overview' ? "bg-accent text-popover shadow-sm" : "hover:bg-background hover:text-foreground"
                )}
              >
                Dashboard
              </Link>
              <Link
                href={`/dashboard/your-plan`}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  currentTab === 'your-plan' ? "bg-accent text-popover shadow-sm" : "hover:bg-background hover:text-foreground"
                )}
              >
                Your Plan
              </Link>
              <Link
                href={`/dashboard/history`}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  currentTab === 'history' ? "bg-accent text-popover shadow-sm" : "hover:bg-background hover:text-foreground"
                )}
              >
                History
              </Link>
            </div>
          </div>
        </motion.div>}

        <div className="w-full px-4">
          {children}
        </div>
      </div>
    </AppLayout>
  )
} 