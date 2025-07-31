import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Activity } from "lucide-react"
import Link from "next/link";

interface DashboardCardLayoutProps {
  title: string
  description: string
  children: ReactNode
  showViewAll?: boolean
  viewAllText?: string
  viewAllHref?: string
  color?: string
  icon?: ReactNode
  iconClick?: any
  showChildren?: boolean
}

export default function DashboardCardLayout({
  title,
  description,
  children,
  showViewAll = true,
  viewAllText = "View All Classes",
  viewAllHref = "#",
  icon,
  iconClick,
  showChildren = true
}: DashboardCardLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-xl shadow-xl border-brand-brown py-4 lg:py-6">
        <CardHeader className="px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-brown">{title}</CardTitle>
            <div onClick={iconClick ? iconClick : null}>
              {icon}
            </div>
          </div>
          <CardDescription className="text-brand-black lg:text-lg">{description}</CardDescription>
        </CardHeader>
        {showChildren && <CardContent className="lg:px-8">
          <div className="space-y-4 lg:space-y-6">
            {children}
            {showViewAll && (
              <div>
                <Link
                  href={viewAllHref}
                  className="text-sm lg:text-base text-[var(--accent)] hover:text-[color:var(--accent)]/80 font-medium flex items-center transition-colors"
                >
                  {viewAllText}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </CardContent>}
      </Card>
    </motion.div>
  )
} 