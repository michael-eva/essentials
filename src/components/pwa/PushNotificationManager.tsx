'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { subscribeUser, unsubscribeUser } from '@/app/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Utility function to convert base64 URL to Uint8Array
const base64UrlToUint8Array = (base64UrlData: string) => {
  const padding = '='.repeat((4 - base64UrlData.length % 4) % 4);
  const base64 = (base64UrlData + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const buffer = new Uint8Array(rawData.length);

  for(let i = 0; i < rawData.length; ++i) {
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
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false)

  useEffect(() => {
    // Check if we're in a browser environment and service workers are supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
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
        // Check if user is already subscribed
        checkSubscription(registration)
      } else {
        // Try to register service worker
        const newRegistration = await navigator.serviceWorker.register('/sw.js')
        setServiceWorkerReady(true)
        checkSubscription(newRegistration)
      }
    } catch (error) {
      console.error('Error with service worker:', error)
              // Don't show alert for development or unsupported environments
        if (process.env.NODE_ENV === 'production') {
          alert('Error with service worker: ' + String(error))
        }
    }
  }

  const checkSubscription = async (registration: ServiceWorkerRegistration) => {
    try {
      const subscription = await getPushSubscription(registration)
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const subscribeToNotifications = async () => {
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
      await subscribeUser(raw)
      setIsSubscribed(true)
    } catch (error) {
      console.error('Error subscribing to notifications:', error)
      alert('Failed to subscribe to notifications')
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
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        throw new Error('Service worker not registered')
      }
      
      const subscription = await getPushSubscription(registration)
      
      if (subscription) {
        await unsubscribeFromPushMessages(subscription)
        await unsubscribeUser()
        setIsSubscribed(false)
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error)
      alert('Failed to unsubscribe from notifications')
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
    <Card>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>
          Get notified about your workouts, progress updates, and fitness tips.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubscribed ? (
          <Button
            onClick={unsubscribeFromNotifications}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? 'Unsubscribing...' : 'Unsubscribe from Notifications'}
          </Button>
        ) : (
          <Button
            onClick={subscribeToNotifications}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? 'Subscribing...' : 'Subscribe to Notifications'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 