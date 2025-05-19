import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface DashboardCardLayoutProps {
  title: string
  description: string
  children: ReactNode
  showViewAll?: boolean
  viewAllText?: string
  viewAllHref?: string
}

export default function DashboardCardLayout({
  title,
  description,
  children,
  showViewAll = true,
  viewAllText = "View All Classes",
  viewAllHref = "#"
}: DashboardCardLayoutProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {children}
          {showViewAll && (
            <div className="pt-2">
              <a href={viewAllHref} className="text-sm text-secondary hover:text-secondary/80 font-medium flex items-center">
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
  )
} 