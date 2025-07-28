import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { sendNotification } from "@/app/actions";
import { env } from "@/env";

// Type definition for the request body
interface NotificationRequest {
  userId: string;
  title?: string;
  message: string;
}

// Configure VAPID details
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:michael@extensa.studio",
    vapidPublicKey,
    vapidPrivateKey,
  );
}

export async function POST(request: NextRequest) {
  try {
    // Check API key authentication
    const apiKey = request.headers.get("apiKey");
    if (!apiKey || apiKey !== env.WEBHOOK_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as NotificationRequest;

    // Validate required fields
    if (!body.userId || typeof body.userId !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid userId" },
        { status: 400 },
      );
    }

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid message" },
        { status: 400 },
      );
    }

    const title = typeof body.title === "string" ? body.title : "Essentials";

    const result = await sendNotification(body.userId, body.message, title);

    if (result.statusCode === 201) {
      return NextResponse.json({ success: true });
    }

    if (result.statusCode !== 201) {
      return NextResponse.json(result, { status: result.statusCode });
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  } catch (error) {
    console.error("Error sending notification to user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
