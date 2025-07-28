"use client";

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import DefaultBox from "../../global/DefaultBox"
import { PushNotificationManager } from "@/components/pwa/PushNotificationManager"
import Link from "next/link"

export default function AppSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/profile">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">App Settings</h2>
          <p className="text-gray-600">Configure your app preferences and notifications</p>
        </div>
      </div>

      <DefaultBox
        title="Notifications"
        description="Manage your push notification preferences"
        showViewAll={false}
      >
        <div className="space-y-6">
          <PushNotificationManager />
        </div>
      </DefaultBox>

      <DefaultBox
        title="Preferences"
        description="Additional app configuration options"
        showViewAll={false}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            More app settings and preferences will be available here in future updates.
          </p>
        </div>
      </DefaultBox>
    </div>
  )
}