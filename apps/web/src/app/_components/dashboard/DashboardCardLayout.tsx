import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface DashboardCardLayoutProps {
  title: string
  description: string
  children: ReactNode
  showViewAll?: boolean
  viewAllText?: string
  viewAllHref?: string
  color?: string
}

export default function DashboardCardLayout({
  title,
  description,
  children,
  showViewAll = true,
  viewAllText = "View All Classes",
  viewAllHref = "#",// Default iOS blue
}: DashboardCardLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white text-[var(--card-foreground)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-2xl font-semibold text-gray-900">{title}</CardTitle>
          </div>
          <CardDescription className="text-[var(--muted-foreground)]">{description}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="space-y-4">
            {children}
            {showViewAll && (
              <div>
                <a
                  href={viewAllHref}
                  className="text-sm text-[var(--accent)] hover:text-[color:var(--accent)]/80 font-medium flex items-center transition-colors"
                >
                  {viewAllText}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 