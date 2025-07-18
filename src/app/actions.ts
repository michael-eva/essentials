'use server'

import webpush from 'web-push'
import { getAllPushSubscriptions } from '@/drizzle/src/db/queries'
import { deletePushSubscriptionByEndpoint } from '@/drizzle/src/db/mutations'

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

// Interface for serializable push subscription
interface SerializablePushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// Return type definitions
interface SubscribeResult {
  success: boolean
  action?: string
  error?: string
}

interface UnsubscribeResult {
  success: boolean
  error?: string
}

interface SendNotificationResult {
  success: boolean
  sent?: number
  failed?: number
  total?: number
  error?: string
}

interface SendToUserResult {
  success: boolean
  sent?: number
  error?: string
}

export async function subscribeUser(sub: SerializablePushSubscription, userId: string): Promise<SubscribeResult> {
  try {
    // Call the API endpoint to save subscription to database
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        userId: userId,
      }),
    })

    const result = await response.json() as { success: boolean; action?: string; error?: string }
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to subscribe user')
    }
    
    return { success: true, action: result.action }
  } catch (error) {
    console.error('Error subscribing user:', error)
    return { success: false, error: 'Failed to subscribe user' }
  }
}

export async function unsubscribeUser(endpoint: string): Promise<UnsubscribeResult> {
  try {
    // Call the API endpoint to remove subscription from database
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: endpoint,
      }),
    })

    const result = await response.json() as { success: boolean; error?: string }
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to unsubscribe user')
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error unsubscribing user:', error)
    return { success: false, error: 'Failed to unsubscribe user' }
  }
}

export async function sendNotification(message: string, title = 'Essentials'): Promise<SendNotificationResult> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { success: false, error: 'VAPID keys not configured' }
  }

  // Get all subscriptions from database
  const subscriptions = await getAllPushSubscriptions()
  
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
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
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

  // Remove failed subscriptions from database
  if (failed > 0) {
    const failedSubscriptions = results
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status === 'rejected')
      .map(({ index }) => subscriptions[index])

    // Delete failed subscriptions from database
    await Promise.allSettled(
      failedSubscriptions.map((sub) => 
        sub ? deletePushSubscriptionByEndpoint(sub.endpoint) : Promise.resolve()
      )
    )
  }

  return {
    success: successful > 0,
    sent: successful,
    failed,
    total: subscriptions.length,
  }
}

// Helper function to send notification to specific user
export async function sendNotificationToUser(userId: string, message: string, title = 'Essentials'): Promise<SendToUserResult> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send-to-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title,
        message,
      }),
    });

    const result = await response.json() as { success: boolean; sent?: number; error?: string };
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send notification to user');
    }
    
    return result;
  } catch (error) {
    console.error('Error sending notification to user:', error);
    return { success: false, error: 'Failed to send notification to user' };
  }
}

// Example function to send workout reminders
export async function sendWorkoutReminder(userId: string, workoutName: string): Promise<SendToUserResult> {
  return sendNotificationToUser(
    userId,
    `Time for your ${workoutName} workout! 💪`,
    'Workout Reminder'
  );
}

// Example function to send progress updates
export async function sendProgressUpdate(userId: string, milestone: string): Promise<SendToUserResult> {
  return sendNotificationToUser(
    userId,
    `Congratulations! You've reached: ${milestone} 🎉`,
    'Progress Update'
  );
}

// Example function to send workout completion notifications
export async function sendWorkoutCompleted(userId: string, workoutName: string): Promise<SendToUserResult> {
  return sendNotificationToUser(
    userId,
    `Great job completing your ${workoutName} workout! 🎉`,
    'Workout Completed'
  );
}

// Example function to send weekly progress summaries
export async function sendWeeklyProgress(userId: string, completedWorkouts: number): Promise<SendToUserResult> {
  return sendNotificationToUser(
    userId,
    `You completed ${completedWorkouts} workouts this week! Keep up the amazing work! 💪`,
    'Weekly Progress'
  );
} 