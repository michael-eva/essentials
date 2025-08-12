import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Basic health check - can be extended to check database connectivity
    return NextResponse.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      service: "essentials"
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Health check failed" },
      { status: 500 }
    );
  }
}