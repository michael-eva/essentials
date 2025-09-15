'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { subscribeUser } from '@/app/actions'
import { useSession } from '@/contexts/SessionContext'
import { api } from '@/trpc/react'
import { Bell, X } from 'lucide-react'
import { env } from '@/env'

// Constants for localStorage
const NOTIFICATION_PROMPT_DISMISSED_KEY = 'notification_prompt_dismissed'
const NOTIFICATION_PROMPT_DELAY = 3000 // 3 seconds after PWA detection

// Utility function to convert base64 URL to Uint8Array
const base64UrlToUint8Array = (base64UrlData: string) => {
  const padding = '='.repeat((4 - base64UrlData.length % 4) % 4);
  const base64 = (base64UrlData + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const buffer = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    buffer[i] = rawData.charCodeAt(i);
  }

  return buffer;
};

// Subscribe to push messages
const subscribeToPushMessages = async (registration: ServiceWorkerRegistration, publicKey: string) => {
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToUint8Array(publicKey)
  });
};

interface NotificationPromptProps {
  isPWAInstalled: boolean
}

export function NotificationPrompt({ isPWAInstalled }: NotificationPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useSession()
  const { data: notificationSubscriptionStatus } = api.notifications.getNotificationSubscriptionStatus.useQuery()
  const utils = api.useUtils()

  // Check if PWA is already installed
  const checkPWAInstallation = () => {
    // Check if running in standalone mode (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true
    }

    // Check if running in fullscreen mode (some PWAs)
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return true
    }

    // Check navigator.standalone for iOS
    if ('standalone' in window.navigator && (window.navigator as any).standalone) {
      return true
    }

    return false
  }

  // Check if we should show the notification prompt
  const shouldShowPrompt = () => {
    // Don't show if user is not authenticated
    if (!user?.id) return false

    // Don't show if user already has notifications enabled
    if (notificationSubscriptionStatus?.hasSubscription) return false

    // Don't show if user has already dismissed this prompt
    if (localStorage.getItem(NOTIFICATION_PROMPT_DISMISSED_KEY)) return false

    // Don't show if PWA is not installed
    if (!isPWAInstalled) return false

    // Don't show if push notifications aren't supported
    if (!('serviceWorker' in navigator && 'PushManager' in window)) return false

    return true
  }

  useEffect(() => {
    // Wait for user and subscription status to load
    if (!user || notificationSubscriptionStatus === undefined) return

    // Check if we should show the prompt
    if (shouldShowPrompt()) {
      // Delay showing the prompt to let the user get oriented
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, NOTIFICATION_PROMPT_DELAY)

      return () => clearTimeout(timer)
    }
  }, [user, notificationSubscriptionStatus, isPWAInstalled])

  const handleEnableNotifications = async () => {
    // Check if user is authenticated
    if (!user?.id) {
      alert('Please log in to subscribe to notifications')
      return
    }

    const vapidPublicKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) {
      alert('Push notifications are not configured. Please contact support.')
      return
    }

    setIsLoading(true)
    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        throw new Error('Service worker not registered')
      }

      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        // User denied permission - close dialog and mark as dismissed
        handleDismiss()
        return
      }

      // Subscribe to push notifications
      const subscription = await subscribeToPushMessages(registration, vapidPublicKey)

      // Convert subscription to a serializable object
      const raw = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }

      // Send subscription to server
      const result = await subscribeUser(raw, user.id)
      if (result.success) {
        // Invalidate and refetch the subscription status
        await utils.notifications.getNotificationSubscriptionStatus.invalidate()
        // Close the dialog
        setShowPrompt(false)
        // Mark as dismissed so it doesn't show again
        localStorage.setItem(NOTIFICATION_PROMPT_DISMISSED_KEY, Date.now().toString())
      } else {
        throw new Error(result.error || 'Failed to subscribe')
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error)
      alert('Failed to enable notifications: ' + String(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Mark as dismissed so it doesn't show again
    localStorage.setItem(NOTIFICATION_PROMPT_DISMISSED_KEY, Date.now().toString())
  }

  const handleLater = () => {
    setShowPrompt(false)
    // Don't mark as permanently dismissed - will show again next time they open the PWA
  }

  if (!showPrompt) return null

  return (
    <Dialog open={showPrompt} onOpenChange={handleDismiss}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-brand-bright-orange/10 flex items-center justify-center">
              <Bell className="h-6 w-6 text-brand-bright-orange" />
            </div>
            <div>
              <DialogTitle className="text-lg">Stay Updated!</DialogTitle>
              <DialogDescription className="text-sm">
                Get notified about your workouts and progress
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Enable notifications to receive:</p>
            <ul className="mt-2 space-y-1 ml-4">
              <li>• Workout reminders</li>
              <li>• Progress updates</li>
              <li>• New content alerts</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Enabling...' : 'Enable Notifications'}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleLater}
                className="flex-1"
                size="sm"
              >
                Maybe Later
              </Button>
              <Button
                variant="ghost"
                onClick={handleDismiss}
                className="flex-1"
                size="sm"
              >
                No Thanks
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 