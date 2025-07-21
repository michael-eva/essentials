"use server";

import webpush from "web-push";
import { getPushSubscriptionByUserId } from "@/drizzle/src/db/queries";
import { deletePushSubscriptionByEndpoint } from "@/drizzle/src/db/mutations";

// Configure VAPID details for push notifications (only if keys are available)
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:michael@extensa.studio", // Replace with your actual email
    vapidPublicKey,
    vapidPrivateKey,
  );
}

// Interface for serializable push subscription
interface SerializablePushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Return type definitions
interface SubscribeResult {
  success: boolean;
  action?: string;
  error?: string;
}

interface UnsubscribeResult {
  success: boolean;
  error?: string;
}

interface SendNotificationResult {
  statusCode: number;
  error?: string;
}

interface SendToUserResult {
  success: boolean;
  sent?: number;
  error?: string;
}

export async function subscribeUser(
  sub: SerializablePushSubscription,
  userId: string,
): Promise<SubscribeResult> {
  try {
    // Call the API endpoint to save subscription to database
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/subscribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          userId: userId,
        }),
      },
    );

    const result = (await response.json()) as {
      success: boolean;
      action?: string;
      error?: string;
    };

    if (!result.success) {
      throw new Error(result.error || "Failed to subscribe user");
    }

    return { success: true, action: result.action };
  } catch (error) {
    console.error("Error subscribing user:", error);
    return { success: false, error: "Failed to subscribe user" };
  }
}

export async function unsubscribeUser(
  endpoint: string,
): Promise<UnsubscribeResult> {
  try {
    // Call the API endpoint to remove subscription from database
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/unsubscribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: endpoint,
        }),
      },
    );

    const result = (await response.json()) as {
      success: boolean;
      error?: string;
    };

    if (!result.success) {
      throw new Error(result.error || "Failed to unsubscribe user");
    }

    return { success: true };
  } catch (error) {
    console.error("Error unsubscribing user:", error);
    return { success: false, error: "Failed to unsubscribe user" };
  }
}

export async function sendNotification(
  userID: string,
  message: string,
  title = "Essentials",
): Promise<SendNotificationResult> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { statusCode: 500, error: "VAPID keys not configured" };
  }

  // Get subscription from database
  const subscription = await getPushSubscriptionByUserId(userID);

  if (!subscription) {
    return { statusCode: 500, error: "No subscriptions available" };
  }

  const notificationPayload = {
    title,
    body: message,
    icon: "/logo/essentials_logo.png",
    badge: "/logo/essentials_logo.png",
  };

  try {
    const result = await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(notificationPayload),
    );

    return {
      statusCode: result.statusCode,
      error: result.statusCode !== 201 ? result.body : undefined,
    };
  } catch (error: any) {
    // Handle expired/invalid subscriptions (410 Gone)
    if (error.statusCode === 410) {
      console.log(
        `Push subscription expired for user ${userID}, removing from database:`,
        subscription.endpoint,
      );

      // Remove the invalid subscription from database
      try {
        await deletePushSubscriptionByEndpoint(subscription.endpoint);
      } catch (deleteError) {
        console.error("Failed to delete expired subscription:", deleteError);
      }

      // Return success since we handled the expired subscription gracefully
      return {
        statusCode: 201,
        error: undefined,
      };
    }

    // Handle other push notification errors
    console.error("Push notification error:", error);
    return {
      statusCode: error.statusCode || 500,
      error: error.body || error.message || "Failed to send push notification",
    };
  }
}
