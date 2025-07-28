'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { subscribeUser, unsubscribeUser } from '@/app/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from '@/contexts/SessionContext'
import { api } from '@/trpc/react'
import { Download } from 'lucide-react'
import { InstallPrompt } from './InstallPrompt'

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

// Unsubscribe from push messages
const unsubscribeFromPushMessages = async (subscription: PushSubscription) => {
  return subscription.unsubscribe();
};

// Get push subscription
const getPushSubscription = async (registration: ServiceWorkerRegistration) => {
  return registration.pushManager.getSubscription();
};

export function PushNotificationManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false)
  const [isPWAInstalled, setIsPWAInstalled] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
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

  useEffect(() => {
    // Check if we're in a browser environment and service workers are supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      // Check PWA installation status
      setIsPWAInstalled(checkPWAInstallation())

      // Try to get service worker ready
      checkServiceWorker()
    }
  }, [])

  const checkServiceWorker = async () => {
    try {
      // Ensure we're in a browser environment
      if (typeof window === 'undefined' || !navigator.serviceWorker) {
        throw new Error('Service workers not supported in this environment')
      }

      // First check if service worker is registered
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        setServiceWorkerReady(true)
      } else {
        // Try to register service worker
        const newRegistration = await navigator.serviceWorker.register('/sw.js')
        setServiceWorkerReady(true)
      }
    } catch (error) {
      console.error('Error with service worker:', error)
      // Don't show alert for development or unsupported environments
      if (process.env.NODE_ENV === 'production') {
        alert('Error with service worker: ' + String(error))
      }
    }
  }

  const handleInstallClick = () => {
    setShowInstallPrompt(true)
  }

  const handleInstallPromptClose = () => {
    setShowInstallPrompt(false)
  }


  const subscribeToNotifications = async () => {
    // Check if user is authenticated
    if (!user?.id) {
      alert('Please log in to subscribe to notifications')
      return
    }

    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !navigator.serviceWorker) {
      alert('Push notifications are not supported in this environment')
      return
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
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
        alert('Notification permission denied')
        return
      }

      // Subscribe to push notifications using the new approach
      const subscription = await subscribeToPushMessages(registration, vapidPublicKey)

      // Convert subscription to a serializable object
      const raw = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
      // Send subscription to server
      if (user?.id) {
        const result = await subscribeUser(raw, user.id)
        if (result.success) {
          // Invalidate and refetch the subscription status
          await utils.notifications.getNotificationSubscriptionStatus.invalidate()
        } else {
          throw new Error(result.error || 'Failed to subscribe')
        }
      } else {
        throw new Error('User not authenticated')
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error)
      alert('Failed to subscribe to notifications: ' + String(error))
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribeFromNotifications = async () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !navigator.serviceWorker) {
      alert('Push notifications are not supported in this environment')
      return
    }

    setIsLoading(true)
    try {
      let browserUnsubscribed = false
      let databaseUnsubscribed = false
      let subscriptionEndpoint: string | null = null

      // Try to get browser subscription and unsubscribe
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          const subscription = await getPushSubscription(registration)
          if (subscription) {
            subscriptionEndpoint = subscription.endpoint
            await unsubscribeFromPushMessages(subscription)
            browserUnsubscribed = true
            console.log('Successfully unsubscribed from browser push notifications')
          } else {
            console.log('No browser subscription found')
          }
        } else {
          console.log('No service worker registration found')
        }
      } catch (browserError) {
        console.warn('Error unsubscribing from browser:', browserError)
        // Continue to database cleanup even if browser unsubscribe fails
      }

      // Try to remove from database - we'll try with the endpoint if we have it,
      // otherwise the server action should handle cleanup based on user ID
      try {
        if (subscriptionEndpoint) {
          const result = await unsubscribeUser(subscriptionEndpoint, user?.id)
          if (result.success) {
            databaseUnsubscribed = true
            console.log('Successfully removed subscription from database')
          } else {
            throw new Error(result.error || 'Failed to remove from database')
          }
        } else {
          // If we don't have an endpoint, we can still clean up using user ID
          console.log('No endpoint available, attempting database cleanup by user ID...')
          if (user?.id) {
            const result = await unsubscribeUser('', user.id)
            if (result.success) {
              databaseUnsubscribed = true
              console.log('Database cleanup by user ID successful')
            }
          } else {
            console.warn('No user ID available for database cleanup')
          }
        }
      } catch (databaseError) {
        console.warn('Error removing from database:', databaseError)
        // If we successfully unsubscribed from browser but failed database cleanup,
        // still consider it a partial success
      }

      // If either operation succeeded, invalidate the query
      if (browserUnsubscribed || databaseUnsubscribed) {
        await utils.notifications.getNotificationSubscriptionStatus.invalidate()
        console.log('Query cache invalidated, UI should update')
      } else {
        throw new Error('Failed to unsubscribe from both browser and database')
      }

    } catch (error) {
      console.error('Error unsubscribing from notifications:', error)
      alert('Failed to unsubscribe from notifications: ' + String(error))
    } finally {
      setIsLoading(false)
    }
  }

  // Check if service workers are supported
  const isServiceWorkerSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window

  if (!isServiceWorkerSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Get notified about your workouts, progress updates, and fitness tips.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Push notifications are not supported in this browser or environment.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!serviceWorkerReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Get notified about your workouts, progress updates, and fitness tips.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Setting up push notifications...
          </p>
          <Button
            onClick={checkServiceWorker}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? 'Setting up...' : 'Retry Setup'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Get notified about your workouts, progress updates, and fitness tips.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Install App Button - Show if PWA is not installed */}
            {!isPWAInstalled && (
              <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Install Essentials App</p>
                    <p className="text-xs text-blue-700">Get faster access and offline features</p>
                  </div>
                  <Button
                    onClick={handleInstallClick}
                    size="sm"
                    variant="outline"
                    className="bg-white hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Install
                  </Button>
                </div>
              </div>
            )}

            {/* Notification Subscription Button */}
            {notificationSubscriptionStatus?.hasSubscription ? (
              <Button
                onClick={unsubscribeFromNotifications}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {isLoading ? 'Unsubscribing...' : 'Unsubscribe from Notifications'}
              </Button>
            ) : (
              <Button
                onClick={subscribeToNotifications}
                disabled={isLoading}
                size="sm"
                className="w-full"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe to Notifications'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conditionally render InstallPrompt */}
      {showInstallPrompt && <InstallPrompt forceShow={true} onClose={handleInstallPromptClose} />}
    </>
  )
} 