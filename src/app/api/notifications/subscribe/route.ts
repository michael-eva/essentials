import { NextRequest, NextResponse } from "next/server";
import { upsertPushSubscription } from "@/drizzle/src/db/mutations";

export async function POST(request: NextRequest) {
  try {
    const { endpoint, p256dh, auth, userId } = await request.json();

    // Validate required fields
    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid endpoint" },
        { status: 400 },
      );
    }

    if (!p256dh || typeof p256dh !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid p256dh key" },
        { status: 400 },
      );
    }

    if (!auth || typeof auth !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid auth key" },
        { status: 400 },
      );
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid userId" },
        { status: 400 },
      );
    }

    // Upsert subscription (will update if user_id exists, create if new)
    const subscription = await upsertPushSubscription({
      endpoint,
      p256dh,
      auth,
      userId,
    });

    return NextResponse.json({
      success: true,
      subscription,
      message: "Push subscription saved successfully",
    });
  } catch (error) {
    console.error("Error subscribing to notifications:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
