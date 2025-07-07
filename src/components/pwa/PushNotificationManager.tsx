'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { subscribeUser, unsubscribeUser } from '@/app/actions'

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      // Check if user is already subscribed
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const subscribeToNotifications = async () => {
    if (!isSupported) return

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) {
      alert('Push notifications are not configured. Please contact support.')
      return
    }

    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      
      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Notification permission denied')
        return
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      })

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
    if (!isSupported) return

    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
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

  if (!isSupported) {
    return null
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Get notified about your workouts, progress updates, and fitness tips.
      </p>
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
    </div>
  )
} 