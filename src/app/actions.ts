'use server'

import webpush from 'web-push'

// Configure VAPID details for push notifications (only if keys are available)
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:michael@extensa.studio', // Replace with your actual email
    vapidPublicKey,
    vapidPrivateKey
  )
}

// In a production environment, you would store subscriptions in a database
// For now, we'll use a simple in-memory store
// We'll use the browser's PushSubscription type, but only store serializable data
interface SerializablePushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

let subscriptions: SerializablePushSubscription[] = []

export async function subscribeUser(sub: SerializablePushSubscription) {
  try {
    // Check if subscription already exists
    const exists = subscriptions.some(
      (existing) => existing.endpoint === sub.endpoint
    )
    
    if (!exists) {
      subscriptions.push(sub)
    }
    
    // In production, save to database:
    // await db.subscriptions.create({ data: { endpoint: sub.endpoint, ... } })
    
    return { success: true }
  } catch (error) {
    console.error('Error subscribing user:', error)
    return { success: false, error: 'Failed to subscribe user' }
  }
}

export async function unsubscribeUser() {
  try {
    // In production, remove from database:
    // await db.subscriptions.delete({ where: { userId: userId } })
    
    return { success: true }
  } catch (error) {
    console.error('Error unsubscribing user:', error)
    return { success: false, error: 'Failed to unsubscribe user' }
  }
}

export async function sendNotification(message: string, title = 'Essentials') {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { success: false, error: 'VAPID keys not configured' }
  }

  if (subscriptions.length === 0) {
    return { success: false, error: 'No subscriptions available' }
  }

  const notificationPayload = {
    title,
    body: message,
    icon: '/logo/essentials_logo.png',
    badge: '/logo/essentials_logo.png',
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1',
    },
  }

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(
        subscription,
        JSON.stringify(notificationPayload)
      )
    )
  )

  const successful = results.filter(
    (result) => result.status === 'fulfilled'
  ).length

  const failed = results.filter(
    (result) => result.status === 'rejected'
  ).length

  // Remove failed subscriptions
  if (failed > 0) {
    const failedSubscriptions = results
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status === 'rejected')
      .map(({ index }) => subscriptions[index])

    subscriptions = subscriptions.filter(
      (sub) => !failedSubscriptions.includes(sub)
    )
  }

  return {
    success: successful > 0,
    sent: successful,
    failed,
    total: subscriptions.length,
  }
}

// Example function to send workout reminders
export async function sendWorkoutReminder(userId: string, workoutName: string) {
  return sendNotification(
    `Time for your ${workoutName} workout! 💪`,
    'Workout Reminder'
  )
}

// Example function to send progress updates
export async function sendProgressUpdate(userId: string, milestone: string) {
  return sendNotification(
    `Congratulations! You've reached: ${milestone} 🎉`,
    'Progress Update'
  )
} 