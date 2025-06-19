import type { UserContext } from "./context-manager";
import { getAiSystemPrompt } from "@/drizzle/src/db/queries";
import { insertAiChatMessages } from "@/drizzle/src/db/mutations";
import OpenAI from "openai";

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

/**
 * Formats user context into a readable text format for the AI
 */
function formatUserContextForAI(context: UserContext): string {
  return `
PROFILE:
- Name: ${context.profile.name ?? "Not specified"}
- Age: ${context.profile.age ?? "Not specified"}
- Height: ${context.profile.height ?? "Not specified"} cm
- Weight: ${context.profile.weight ?? "Not specified"} kg
- Gender: ${context.profile.gender ?? "Not specified"}
- Fitness Level: ${context.profile.fitnessLevel ?? "Not specified"}
- Goals: ${context.profile.fitnessGoals?.join(", ") ?? "Not specified"}
- Workout Frequency: ${context.profile.exerciseFrequency ?? "Not specified"}
- Session Length: ${context.profile.sessionLength ?? "Not specified"}
- Exercises: ${context.profile.exercises?.join(", ") ?? "Not specified"}
- Custom Exercises: ${context.profile.otherExercises?.join(", ") ?? "Not specified"}

PILATES EXPERIENCE:
- Has Experience: ${context.profile.pilatesExperience ? "Yes" : "No"}
- Studio Frequency: ${context.profile.studioFrequency ?? "Not specified"}
- Session Preference: ${context.profile.sessionPreference ?? "Not specified"}
- Apparatus Preference: ${context.profile.apparatusPreference?.join(", ") ?? "Not specified"}

HEALTH INFORMATION:
- Injuries: ${context.profile.health.injuries ? `Yes - ${context.profile.health.injuriesDetails}` : "No injuries reported"}
- Chronic Conditions: ${context.profile.health.chronicConditions?.join(", ") ?? "None"}
- Pregnancy: ${context.profile.health.pregnancy ?? "Not specified"}

RECENT ACTIVITY:
- Total Workouts (Last 30 days): ${context.recentActivity.recentWorkouts.length}
- Weekly Average: ${context.recentActivity.consistency.weeklyAverage} workouts
- Monthly Average: ${context.recentActivity.consistency.monthlyAverage} workouts
- Current Streak: ${context.recentActivity.consistency.streak} days

RECENTLY COMPLETED WORKOUTS:
${
  context.recentActivity.recentWorkouts.length > 0
    ? context.recentActivity.recentWorkouts
        .slice(-5) // Last 5 workouts
        .map(
          (workout) =>
            `- ${workout.workout?.name ?? "Unnamed"} (${workout.workout?.activityType ?? "Unknown"}) - ${workout.workoutTracking.durationHours}h ${workout.workoutTracking.durationMinutes}m - Intensity: ${workout.workoutTracking.intensity}/10 - Would do again: ${workout.workoutTracking.wouldDoAgain ? "Yes" : "No"}`,
        )
        .join("\n")
    : "- No recent workouts recorded"
}

CURRENT WORKOUT PLAN:
${
  context.workoutPlan.plannedWorkouts.length > 0
    ? context.workoutPlan.plannedWorkouts
        .map(
          (workout, index) =>
            `- Workout ${index + 1}: ${workout.name}
             - Description: ${workout.description ?? "No description"}
             - Activity Type: ${workout.activityType ?? "Not specified"}
             - Duration: ${workout.duration ?? "Not specified"}
             - Level: ${workout.level ?? "Not specified"}
             - Has it been booked: ${workout.isBooked ? "Yes" : "No"}
             - Other Notes: ${workout.status ?? "None"}`,
        )
        .join("\n")
    : "- No planned workouts"
}

PROGRESS & CHALLENGES:
- Current Challenges: ${context.progress.challenges?.join(", ") ?? "Not specified"}
- Recent Improvements: ${context.progress.improvements?.join(", ") ?? "Not specified"}

MOTIVATION:
- Motivation Factors: ${context.profile.motivation?.join(", ") ?? "Not specified"}
- Other Motivations: ${context.profile.otherMotivation?.join(", ") ?? "Not specified"}
- Progress Tracking Methods: ${context.profile.progressTracking?.join(", ") ?? "Not specified"}
`;
}
