'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UpdateNotificationProps {
  isVisible: boolean
  onUpdate: () => void
  onDismiss: () => void
}

export function UpdateNotification({ isVisible, onUpdate, onDismiss }: UpdateNotificationProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [shouldAutoUpdate, setShouldAutoUpdate] = useState(false)

  // Auto-update after 10 minutes if user dismisses
  useEffect(() => {
    if (!isVisible || shouldAutoUpdate) return

    const autoUpdateTimer = setTimeout(() => {
      setShouldAutoUpdate(true)
      handleUpdate()
    }, 10 * 60 * 1000) // 10 minutes

    return () => {
      clearTimeout(autoUpdateTimer)
    }
  }, [isVisible, shouldAutoUpdate])

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await onUpdate()
    } catch (error) {
      console.error('Update failed:', error)
      setIsUpdating(false)
      // Don't hide the notification automatically on error
    }
  }

  const handleDismiss = () => {
    onDismiss()
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4">
      <Card className={cn(
        "bg-card border-border shadow-warm-lg animate-in slide-in-from-top-4 duration-300",
        "border-2 border-brand-bright-orange/20 bg-white",
        "shadow-2xl backdrop-blur-sm"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className={cn(
                "h-5 w-5 text-brand-bright-orange",
                shouldAutoUpdate && "animate-spin"
              )} />
              <CardTitle className="text-base">Update Available</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={handleDismiss}
              disabled={isUpdating}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            A new version is ready with the latest features and improvements.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              size="sm"
              className="flex-1"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Now'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              disabled={isUpdating}
              size="sm"
            >
              Later
            </Button>
          </div>
          {shouldAutoUpdate && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Auto-updating in progress...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 