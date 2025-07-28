"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Trash2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/trpc/react"
import DefaultBox from "../../global/DefaultBox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"

export default function DangerZone() {
  const [showClearDataDialog, setShowClearDataDialog] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")
  const [isClearing, setIsClearing] = useState(false)
  const utils = api.useUtils()

  const { mutate: clearAllData } = api.auth.clearAllUserData.useMutation({
    onSuccess: (result) => {
      toast.success(result.message)
      setShowClearDataDialog(false)
      setConfirmationText("")
      utils.invalidate()
    },
    onError: (error) => {
      console.error("Error clearing data:", error)
      toast.error(error.message || "Failed to clear data. Please try again.")
    },
    onSettled: () => {
      setIsClearing(false)
    }
  })

  const handleClearAllData = () => {
    if (confirmationText !== "DELETE ALL MY DATA") {
      toast.error("Please type the confirmation text exactly as shown")
      return
    }

    setIsClearing(true)
    clearAllData({ confirmText: confirmationText })
  }

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
          <h2 className="text-2xl font-bold text-gray-900">Danger Zone</h2>
          <p className="text-gray-600">Permanently delete all your data</p>
        </div>
      </div>

      <DefaultBox
        title="Data Deletion"
        description="This action cannot be undone"
        showViewAll={false}
      >
        <div className="border border-red-200 rounded-lg p-6 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Clear All Data</h3>
              <p className="text-red-700 text-sm mb-4">
                This will permanently delete all of your data including:
              </p>
              <ul className="text-red-700 text-sm mb-4 list-disc list-inside space-y-1">
                <li>All onboarding information and preferences</li>
                <li>Workout plans and schedules</li>
                <li>Exercise tracking and progress data</li>
                <li>AI chat history and conversations</li>
                <li>Personal trainer interactions</li>
              </ul>
              <div className="bg-red-100 border border-red-200 rounded p-3 mb-4">
                <p className="text-red-800 text-sm font-medium">
                  ⚠️ This action cannot be undone. Your account will remain active, but all your data will be lost forever.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowClearDataDialog(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All My Data
              </Button>
            </div>
          </div>
        </div>
      </DefaultBox>

      <Dialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Data Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              This action will permanently delete ALL of your data and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-800 text-sm font-medium mb-2">
                To confirm, type: <span className="font-mono bg-red-100 px-1 rounded">DELETE ALL MY DATA</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation">Confirmation</Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type the confirmation text..."
                className="font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="destructive"
                onClick={handleClearAllData}
                disabled={isClearing || confirmationText !== "DELETE ALL MY DATA"}
                className="flex-1"
              >
                {isClearing ? "Deleting..." : "Delete All Data"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowClearDataDialog(false)
                  setConfirmationText("")
                }}
                disabled={isClearing}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}