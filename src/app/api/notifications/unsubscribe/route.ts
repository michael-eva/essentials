import { NextRequest, NextResponse } from "next/server";
import { deletePushSubscriptionByEndpoint } from "@/drizzle/src/db/mutations";

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    // Validate required fields
    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid endpoint" },
        { status: 400 },
      );
    }

    // Delete the subscription
    await deletePushSubscriptionByEndpoint(endpoint);
    
    return NextResponse.json({ 
      success: true, 
      message: "Successfully unsubscribed from notifications"
    });
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
} 