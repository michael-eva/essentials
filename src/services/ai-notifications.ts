import type { UserContext } from "./context-manager";
import { getAiSystemPrompt } from "@/drizzle/src/db/queries";
import {
  insertNotification,
} from "@/drizzle/src/db/mutations";
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
  // Fetch user's system prompt
  const systemPrompt = await getAiSystemPrompt(userId);

  // Build the full system context including user context
  const fullSystemContext = buildNotificationContext(
    systemPrompt?.prompt ?? "",
    systemPrompt?.name ?? "",
    userContext,
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
            scheduledTime: z.string().describe("The time the notification should be sent (ISO string format)"),
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
      userId: userId,
      scheduledTime: notification?.scheduledTime ? new Date(notification.scheduledTime) : new Date(),
    });

    return notification?.message ?? "";
  } catch (error) {
    console.error("Error generating AI notification:", error);
    throw new Error("Failed to generate AI notification");
  }
}

/**
 * Builds the notification context including user context and system prompt
 */
function buildNotificationContext(
  systemPrompt: string,
  trainerName: string,
  userContext: UserContext,
): string {
  const defaultPrompt =
    "You are a motivational personal trainer AI assistant. Create encouraging and accountability-focused messages that inspire users to stay on track with their fitness goals.";

  const userContextText = formatUserContextForAI(userContext);
  const name = trainerName ?? "AI Trainer";

  const basePrompt = systemPrompt ?? defaultPrompt;

  return `You are ${name}, a motivational personal trainer AI assistant. 
  
Here is how the user would like you to behave:
${basePrompt}

USER CONTEXT:
${userContextText}

Create a short, motivational notification that:
1. Encourages the user based on their recent activity and progress
2. Motivates them to stay consistent with their fitness journey
3. Holds them accountable to their goals
4. Reminds them of their upcoming planned workouts
5. Reinforces their fitness goals
6. Is done at the right time of day. Motivation should be high in the morning and afternoon.


Current date and time: ${new Date().toISOString()}

The notification should be:
- Brief and impactful (1-2 sentences maximum)
- Personal and specific to their context
- Positive and encouraging
- Action-oriented
- Focused on their specific goals and recent activity

Format the notification as a friendly, direct message from you (${name}) to the user.`;
}
