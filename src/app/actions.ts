"use server";

import webpush from "web-push";
import { getPushSubscriptionByUserId } from "@/drizzle/src/db/queries";
import {
  deletePushSubscriptionByEndpoint,
  deletePushSubscriptionsByUserId,
  upsertPushSubscription,
} from "@/drizzle/src/db/mutations";

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
    // Validate required fields
    if (!sub.endpoint || typeof sub.endpoint !== "string") {
      throw new Error("Invalid endpoint");
    }

    if (!sub.keys.p256dh || typeof sub.keys.p256dh !== "string") {
      throw new Error("Invalid p256dh key");
    }

    if (!sub.keys.auth || typeof sub.keys.auth !== "string") {
      throw new Error("Invalid auth key");
    }

    if (!userId || typeof userId !== "string") {
      throw new Error("Invalid userId");
    }

    // Upsert subscription directly in the database
    const subscription = await upsertPushSubscription({
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userId,
    });

    return {
      success: true,
      action: subscription ? "updated" : "created",
    };
  } catch (error) {
    console.error("Error subscribing user:", error);
    return { success: false, error: String(error) };
  }
}

export async function unsubscribeUser(
  endpoint: string,
  userId?: string,
): Promise<UnsubscribeResult> {
  try {
    // If we have an endpoint, use it to delete the specific subscription
    if (endpoint && typeof endpoint === "string" && endpoint.trim() !== "") {
      await deletePushSubscriptionByEndpoint(endpoint);
      return { success: true };
    }

    // If no valid endpoint but we have a userId, delete all subscriptions for the user
    if (userId && typeof userId === "string") {
      await deletePushSubscriptionsByUserId(userId);
      return { success: true };
    }

    // If neither endpoint nor userId is provided, we can't proceed
    throw new Error("Either endpoint or userId must be provided");
  } catch (error) {
    console.error("Error unsubscribing user:", error);
    return { success: false, error: String(error) };
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
