import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { getAllUsers, getUpcomingNotifications, getPushSubscriptionByUserId } from "@/drizzle/src/db/queries";
import { generateAiNotification } from "@/services/ai-notifications";
import { buildUserContext } from "@/services/context-manager";
import { checkOnboardingCompletion } from "@/drizzle/src/db/queries";

export async function POST(request: NextRequest) {
  try {
    // Check API key authentication
    const apiKey = request.headers.get('apiKey');
    if (!apiKey || apiKey !== env.WEBHOOK_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all users
    const users = await getAllUsers();
    
    const results = {
      totalUsers: users.length,
      notificationsGenerated: 0,
      errors: [] as string[],
      skipped: [] as string[],
    };

    // Process each user
    for (const user of users) {
      try {
        // Check if user has completed onboarding
        const onboardingComplete = await checkOnboardingCompletion(user.id);
        if (!onboardingComplete) {
          results.skipped.push(`User ${user.id}: Onboarding not completed`);
          continue;
        }

        // Check if user has subscribed to push notifications
        const pushSubscription = await getPushSubscriptionByUserId(user.id);
        if (!pushSubscription) {
          results.skipped.push(`User ${user.id}: No push notification subscription`);
          continue;
        }

        // Check if user has upcoming notifications
        const upcomingNotifications = await getUpcomingNotifications(user.id);
        
        if (upcomingNotifications.length === 0) {
          // No upcoming notifications, generate one
          try {
            // Build user context for AI notification
            const userContext = await buildUserContext(user.id);
            
            // Generate AI notification
            await generateAiNotification(user.id, userContext);
            
            results.notificationsGenerated++;
          } catch (error) {
            const errorMessage = `User ${user.id}: Failed to generate notification - ${error instanceof Error ? error.message : 'Unknown error'}`;
            results.errors.push(errorMessage);
            console.error(errorMessage, error);
          }
        } else {
          results.skipped.push(`User ${user.id}: Has ${upcomingNotifications.length} upcoming notifications`);
        }
      } catch (error) {
        const errorMessage = `User ${user.id}: Processing error - ${error instanceof Error ? error.message : 'Unknown error'}`;
        results.errors.push(errorMessage);
        console.error(errorMessage, error);
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });

  } catch (error) {
    console.error("Error in schedule notifications endpoint:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
