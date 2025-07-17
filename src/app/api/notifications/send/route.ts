import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/app/actions";

export async function POST(request: NextRequest) {
  try {
    const { title, message } = await request.json();

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

    // Use the existing sendNotification function from actions.ts
    const result = await sendNotification(message, title);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        sent: result.sent,
        total: result.total 
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
