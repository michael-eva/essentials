import type { UserContext } from "./context-manager";
import { insertNotification } from "@/drizzle/src/db/mutations";
import { getNotificationPreferences } from "@/drizzle/src/db/queries";
import type { NotificationPreferences } from "@/drizzle/src/db/queries";
import OpenAI from "openai";
import { formatUserContextForAI } from "./context-formatter";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";

const openai = new OpenAI();

/**
 * Generates an AI notification based on user context
 */
export async function generateAiNotification(
  userId: string,
  userContext: UserContext,
): Promise<string> {
  // Get user's notification preferences
  const preferences = await getNotificationPreferences(userId);

  // Determine notification type based on user context and preferences
  const notificationType = determineNotificationType(userContext, preferences);

  // Build the notification context using user preferences
  const fullSystemContext = buildNotificationContext(
    userContext,
    preferences,
    notificationType,
  );

  try {
    const response = await openai.responses.parse({
      model: "gpt-4.1-2025-04-14",
      input: fullSystemContext, // Provide the full system context as the prompt
      max_output_tokens: 300, // Shorter than chat responses
      text: {
        format: zodTextFormat(
          z.object({
            title: z.string().describe("The title of the notification"),
            message: z.string().describe("The message of the notification"),
            scheduledTime: z
              .string()
              .describe(
                "The time the notification should be sent (ISO string format)",
              ),
          }),
          "notification",
        ),
      },
    });

    const notification = response.output_parsed;

    // Save the notification to the database
    await insertNotification({
      title: notification?.title ?? "",
      body: notification?.message ?? "",
      type: notificationType,
      userId: userId,
      scheduledTime: notification?.scheduledTime
        ? new Date(notification.scheduledTime)
        : new Date(),
    });

    return notification?.message ?? "";
  } catch (error) {
    console.error("Error generating AI notification:", error);
    throw new Error("Failed to generate AI notification");
  }
}

/**
 * Determines the type of notification to send based on user context and preferences
 */
function determineNotificationType(
  userContext: UserContext,
  preferences: NotificationPreferences | null,
): "workout_reminder" | "progress_celebration" | "motivation_boost" {
  const enabledTypes = preferences?.enabledTypes ?? [
    "workout_reminder",
    "progress_celebration",
    "motivation_boost",
  ];

  const recentWorkouts = userContext.recentActivity?.recentWorkouts ?? [];
  const streak = userContext.recentActivity?.consistency?.streak ?? 0;

  // If user has missed recent workouts, send accountability nudge

  // If user has completed workouts recently, celebrate progress
  if (
    enabledTypes.includes("progress_celebration") &&
    recentWorkouts.length > 0
  ) {
    return "progress_celebration";
  }

  // Default to workout reminder if enabled, otherwise motivation boost
  if (enabledTypes.includes("workout_reminder")) {
    return "workout_reminder";
  }

  return "motivation_boost";
}

/**
 * Builds the notification context for AI generation
 */
function buildNotificationContext(
  userContext: UserContext,
  preferences: NotificationPreferences | null,
  notificationType: string,
): string {
  const userContextText = formatUserContextForAI(userContext);

  const typeInstructions = {
    workout_reminder:
      "Focus on reminding them about their upcoming workout and motivating them to complete it",
    progress_celebration:
      "Celebrate their recent achievements and progress to keep them motivated",
    motivation_boost:
      "Provide general encouragement and motivation for their fitness journey",
    goal_check_in:
      "Check in on their progress towards their specific fitness goals",
    accountability_nudge:
      "Gently remind them to get back on track with their fitness routine",
    streak_celebration: "Celebrate their consistency and workout streak",
    recovery_reminder: "Remind them about the importance of rest and recovery",
  };

  return `You are a fitness AI assistant. Create motivational messages that inspire users to stay on track with their fitness goals. Always use Australian English spelling and grammar.

NOTIFICATION TYPE: ${notificationType}

TYPE-SPECIFIC INSTRUCTION: ${typeInstructions[notificationType as keyof typeof typeInstructions]}

USER CONTEXT:
${userContextText}

Current date and time: ${new Date().toISOString()}

Create a notification that:
- Is brief and impactful (1-2 sentences maximum)
- Uses a motivational, encouraging tone
- Is specific to their context and recent activity
- Uses Australian English spelling and grammar

Format as a direct message to the user.`;
}
