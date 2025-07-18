import { NextRequest, NextResponse } from "next/server";
import { getPushSubscriptions } from "@/drizzle/src/db/queries";
import { deletePushSubscriptionByEndpoint } from "@/drizzle/src/db/mutations";
import webpush from 'web-push';

// Configure VAPID details
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:michael@extensa.studio',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, message } = await request.json();

    // Validate required fields
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid userId" },
        { status: 400 },
      );
    }

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid title" },
        { status: 400 },
      );
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid message" },
        { status: 400 },
      );
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { success: false, error: "VAPID keys not configured" },
        { status: 500 },
      );
    }

    // Get user's subscriptions
    const subscriptions = await getPushSubscriptions(userId);
    
    if (subscriptions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No subscriptions found for user" },
        { status: 404 },
      );
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
    };

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
    );

    const successful = results.filter(
      (result) => result.status === 'fulfilled'
    ).length;

    const failed = results.filter(
      (result) => result.status === 'rejected'
    ).length;

    // Remove failed subscriptions from database
    if (failed > 0) {
      const failedSubscriptions = results
        .map((result, index) => ({ result, index }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ index }) => subscriptions[index]);

      await Promise.allSettled(
        failedSubscriptions.map((sub) => 
          sub ? deletePushSubscriptionByEndpoint(sub.endpoint) : Promise.resolve()
        )
      );
    }

    return NextResponse.json({ 
      success: successful > 0,
      sent: successful,
      failed,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error('Error sending notification to user:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
} 