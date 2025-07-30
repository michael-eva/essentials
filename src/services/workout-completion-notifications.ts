import { getNotificationPreferences, getPushSubscriptionByUserId } from "@/drizzle/src/db/queries";
import { sendNotification } from "@/app/actions";

/**
 * Triggers a celebration notification after a user completes a workout
 */
export async function triggerWorkoutCompletionNotification(userId: string, workoutName?: string): Promise<void> {
  try {
    // Check if user has push notifications enabled
    const pushSubscription = await getPushSubscriptionByUserId(userId);
    if (!pushSubscription) {
      console.log(`User ${userId} has no push notification subscription, skipping workout completion notification`);
      return;
    }

    // Check if user has progress celebration notifications enabled
    const preferences = await getNotificationPreferences(userId);
    const enabledTypes = preferences?.enabledTypes ?? ["progress_celebration"];
    
    if (!enabledTypes.includes("progress_celebration")) {
      console.log(`User ${userId} has progress celebration notifications disabled, skipping workout completion notification`);
      return;
    }

    // Create a celebratory message
    const title = "Great work! 🎉";
    const body = workoutName 
      ? `Fantastic job completing "${workoutName}"! You're crushing your fitness goals.`
      : "Fantastic job completing your workout! You're crushing your fitness goals.";

    // Send the notification immediately
    const result = await sendNotification(userId, body, title);
    
    if (result.statusCode === 201) {
      console.log(`Workout completion notification sent successfully to user ${userId}`);
    } else {
      console.error(`Failed to send workout completion notification to user ${userId}: ${result.error}`);
    }
  } catch (error) {
    // Don't throw errors - notification failures shouldn't break workout completion
    console.error(`Failed to trigger workout completion notification for user ${userId}:`, error);
  }
}