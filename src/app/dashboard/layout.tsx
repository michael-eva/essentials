'use client'
import AppLayout from "../_components/common/DashboardLayout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout>
      <div className="container max-w-md mx-auto md:max-w-2xl">
        <div className="w-full px-4">
          {children}
        </div>
      </div>
    </AppLayout>
  )
} 