import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/app/actions";
import { env } from "@/env";

// Type definition for the request body
interface NotificationRequest {
  userId: string;
  title?: string;
  message: string;
  notificationId?: string;
}

export async function GET() {
  return NextResponse.json({ status: "API endpoint is working" });
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Test authentication
    const apiKey = request.headers.get("apiKey");
    if (!apiKey || apiKey !== env.WEBHOOK_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Step 2: Test JSON parsing
    let body: NotificationRequest;
    try {
      body = (await request.json()) as NotificationRequest;
    } catch (jsonError) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 },
      );
    }

    // Step 3: Test validation
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

    // Step 4: Test notification sending
    const title = typeof body.title === "string" ? body.title : "Essentials";
    
    let result;
    try {
      result = await sendNotification(body.userId, body.message, title);
    } catch (sendError) {
      return NextResponse.json(
        { success: false, error: "Failed to send notification", details: String(sendError) },
        { status: 500 },
      );
    }

    if (result.statusCode === 201) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: result.error || "Unknown error", statusCode: result.statusCode },
      { status: result.statusCode || 500 },
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Unexpected error", details: String(error) },
      { status: 500 },
    );
  }
}
