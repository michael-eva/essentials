import type { UserContext } from "./context-manager";
import { getAiSystemPrompt } from "@/drizzle/src/db/queries";
import { insertAiChatMessages } from "@/drizzle/src/db/mutations";
import OpenAI from "openai";
import { formatUserContextForAI } from "./context-formatter";

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
    const response = await openai.responses.create({
      model: "gpt-4.1-2025-04-14",
      instructions: fullSystemContext,
      input: [], // No input needed as this is a notification
      max_output_tokens: 300, // Shorter than chat responses
    });

    const notification =
      response.output_text ??
      "Keep up the great work! Remember your fitness goals and stay consistent.";

    // Save the notification as an assistant message
    await insertAiChatMessages({
      userId,
      message: notification,
      content: notification,
      role: "assistant",
    });

    return notification;
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

The notification should be:
- Brief and impactful (4-5 sentences maximum)
- Personal and specific to their context
- Positive and encouraging
- Action-oriented
- Focused on their specific goals and recent activity

Format the notification as a friendly, direct message from you (${name}) to the user.`;
}
