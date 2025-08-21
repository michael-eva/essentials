import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  workout,
  workoutTracking,
  workoutStatusEnum,
  workoutPlan,
  weeklySchedule,
  onboarding,
  user,
  personalTrainerInteractions,
  progressTracking,
  workoutTypeEnum,
  activityTypeEnum,
  AiChatMessages,
  AiSystemPrompt,
  notifications,
  pushSubscriptions,
  notificationPreferences,
  PilatesVideos,
  classDrafts,
  insertUserSchema,
} from "./schema";
import type {
  NewWorkout,
  NewWorkoutPlan,
  NewWeeklySchedule,
  NewOnboarding,
  NewPersonalTrainerInteraction,
  NewProgressTracking,
  ProgressTracking,
  User,
  NewAiChatMessages,
  NewAiSystemPrompt,
  NewNotification,
  NewPushSubscription,
  NewNotificationPreferences,
  Notification,
  PushSubscription,
  NotificationPreferences,
} from "./queries";
import { eq, inArray, and } from "drizzle-orm";
import { trackWorkoutProgress } from "@/services/progress-tracker";
import { getWeeklySchedulesByPlan } from "./queries";
import { z } from "zod";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export type WorkoutTrackingInput = {
  userId: string;
  workoutId?: string | null;
  activityType: "run" | "cycle" | "swim" | "walk" | "class";
  date: Date;
  durationHours?: number | null;
  durationMinutes?: number | null;
  distance?: string | null;
  distanceUnit?: string | null;
  notes?: string | null;
  intensity?: number | null;
  name?: string | null;
  likelyToDoAgain?: number | null;
  exercises?: Array<{
    id: string;
    name: string;
    sets: Array<{
      id: string;
      reps: number;
      weight: number;
    }>;
  }> | null;
};

export type NewWorkoutTracking = WorkoutTrackingInput;

export async function insertWorkoutTracking(data: WorkoutTrackingInput) {
  const result = await db
    .insert(workoutTracking)
    .values({
      userId: data.userId,
      workoutId: data.workoutId,
      activityType: data.activityType,
      date: data.date,
      durationHours: data.durationHours,
      durationMinutes: data.durationMinutes,
      distance: data.distance,
      distanceUnit: data.distanceUnit,
      notes: data.notes,
      intensity: data.intensity,
      name: data.name,
      likelyToDoAgain: data.likelyToDoAgain,
      exercises: data.exercises,
    })
    .returning();
  const newWorkout = result[0]!;

  // Automatically update progress tracking
  await trackWorkoutProgress(data.userId, newWorkout);

  return newWorkout;
}

export async function updateCompletedClass(
  id: string,
  status: (typeof workoutStatusEnum.enumValues)[number],
) {
  const activity = await db
    .update(workout)
    .set({ status })
    .where(eq(workout.id, id));
  return activity;
}

export async function updateWorkoutPlan(
  planId: string,
  data: {
    startDate?: Date | null;
    pausedAt?: Date | null;
    resumedAt?: Date | null;
    totalPausedDuration?: number;
    isActive?: boolean;
    planName?: string;
  },
) {
  const updatedPlan = await db
    .update(workoutPlan)
    .set(data)
    .where(eq(workoutPlan.id, planId));
  return updatedPlan;
}

export async function resumeWorkoutPlanSafely(planId: string, userId: string) {
  // Get the plan and validate in one query
  const currentPlan = await db
    .select()
    .from(workoutPlan)
    .where(and(eq(workoutPlan.id, planId), eq(workoutPlan.userId, userId)))
    .limit(1);

  if (!currentPlan[0]) {
    throw new Error("Plan not found or access denied");
  }

  const plan = currentPlan[0];

  if (!plan.pausedAt) {
    throw new Error("Plan is not paused");
  }

  const now = new Date();
  const pauseDuration = Math.floor(
    (now.getTime() - plan.pausedAt.getTime()) / 1000,
  );
  const newTotalPausedDuration =
    (plan.totalPausedDuration ?? 0) + pauseDuration;

  const result = await db
    .update(workoutPlan)
    .set({
      totalPausedDuration: newTotalPausedDuration,
      resumedAt: now,
      pausedAt: null,
    })
    .where(eq(workoutPlan.id, planId))
    .returning();

  return result[0];
}

/**
 * Deactivates all workout plans for a specific user
 * Used when creating a new plan to ensure only one plan is active at a time
 */
export async function deactivateAllUserPlans(userId: string) {
  const result = await db
    .update(workoutPlan)
    .set({ isActive: false })
    .where(eq(workoutPlan.userId, userId));
  return result;
}
export async function deleteWorkoutPlan(planId: string) {
  // First, get the plan to get the userId
  const plan = await db
    .select()
    .from(workoutPlan)
    .where(eq(workoutPlan.id, planId));

  if (plan.length === 0) {
    // Plan not found, nothing to delete
    return;
  }

  const userId = plan[0]!.userId;

  // Get all weekly schedules for the plan
  const weeklySchedules = await getWeeklySchedulesByPlan(planId);

  if (weeklySchedules.length > 0) {
    const workoutIds = weeklySchedules.map((ws) => ws.workoutId);

    // Delete all workouts associated with the plan and user
    await db
      .delete(workout)
      .where(and(inArray(workout.id, workoutIds), eq(workout.userId, userId)));

    // Delete all weekly schedules for the plan
    await db.delete(weeklySchedule).where(eq(weeklySchedule.planId, planId));
  }

  // Finally, delete the plan itself
  const deletedPlan = await db
    .delete(workoutPlan)
    .where(eq(workoutPlan.id, planId));
  return deletedPlan;
}

export async function insertOnboarding(data: NewOnboarding) {
  try {
    const result = await db
      .insert(onboarding)
      .values(data)
      .onConflictDoUpdate({
        target: onboarding.userId,
        set: {
          ...data,
          updatedAt: new Date(),
        },
      });
    return result;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to insert/update onboarding data");
  }
}

export async function insertUser(data: typeof user.$inferInsert) {
  const result = await db.insert(user).values(data);
  return result;
}

export async function updateUser(
  userId: string,
  data: Partial<Pick<User, "name" | "email">>,
) {
  const result = await db
    .update(user)
    .set(data)
    .where(eq(user.id, userId))
    .returning();
  return result[0] ?? null;
}

export async function clearAllUserData(userId: string) {
  try {
    console.log(`Starting to clear all data for user: ${userId}`);

    // Delete in order to respect foreign key constraints
    // Note: Most of these have cascade delete, but we'll be explicit for safety

    // 1. Clear weekly schedules (references workoutPlan and workout)
    const deletedWeeklySchedules = await db
      .delete(weeklySchedule)
      .where(
        inArray(
          weeklySchedule.planId,
          db
            .select({ id: workoutPlan.id })
            .from(workoutPlan)
            .where(eq(workoutPlan.userId, userId)),
        ),
      )
      .returning();

    // 2. Clear progress tracking (references workoutTracking)
    const deletedProgressTracking = await db
      .delete(progressTracking)
      .where(eq(progressTracking.userId, userId))
      .returning();

    // 3. Clear workout tracking
    const deletedWorkoutTracking = await db
      .delete(workoutTracking)
      .where(eq(workoutTracking.userId, userId))
      .returning();

    // 4. Clear workouts
    const deletedWorkouts = await db
      .delete(workout)
      .where(eq(workout.userId, userId))
      .returning();

    // 5. Clear workout plans
    const deletedWorkoutPlans = await db
      .delete(workoutPlan)
      .where(eq(workoutPlan.userId, userId))
      .returning();

    // 6. Clear onboarding data
    const deletedOnboarding = await db
      .delete(onboarding)
      .where(eq(onboarding.userId, userId))
      .returning();

    // 7. Clear personal trainer interactions
    const deletedPTInteractions = await db
      .delete(personalTrainerInteractions)
      .where(eq(personalTrainerInteractions.userId, userId))
      .returning();

    // 8. Clear AI system prompts
    const deletedAiSystemPrompts = await db
      .delete(AiSystemPrompt)
      .where(eq(AiSystemPrompt.userId, userId))
      .returning();

    // 9. Clear AI chat messages
    const deletedAiChatMessages = await db
      .delete(AiChatMessages)
      .where(eq(AiChatMessages.userId, userId))
      .returning();

    const deletionSummary = {
      weeklySchedules: deletedWeeklySchedules.length,
      progressTracking: deletedProgressTracking.length,
      workoutTracking: deletedWorkoutTracking.length,
      workouts: deletedWorkouts.length,
      workoutPlans: deletedWorkoutPlans.length,
      onboarding: deletedOnboarding.length,
      personalTrainerInteractions: deletedPTInteractions.length,
      aiSystemPrompts: deletedAiSystemPrompts.length,
      aiChatMessages: deletedAiChatMessages.length,
    };

    console.log(
      `Successfully cleared all data for user: ${userId}`,
      deletionSummary,
    );

    return {
      success: true,
      message: "All user data cleared successfully",
      deletedCounts: deletionSummary,
    };
  } catch (error) {
    console.error(`Error clearing user data for ${userId}:`, error);
    throw new Error(
      `Failed to clear user data: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function insertPersonalTrainerInteraction(
  data: NewPersonalTrainerInteraction,
) {
  const interaction = await db.insert(personalTrainerInteractions).values(data);
  return interaction;
}

export async function insertProgressTracking(
  data: NewProgressTracking,
): Promise<ProgressTracking> {
  const result = await db.insert(progressTracking).values(data).returning();
  return result[0]!;
}

export async function insertWorkoutPlan(data: NewWorkoutPlan) {
  const result = await db.insert(workoutPlan).values(data).returning();
  return result[0]!;
}

export async function insertWorkouts(
  workouts: Array<{
    id: string;
    name: string;
    instructor: string;
    duration: number;
    description: string;
    level: string;
    type: (typeof workoutTypeEnum.enumValues)[number];
    status: (typeof workoutStatusEnum.enumValues)[number];
    isBooked: boolean;
    userId: string;
    classId?: string;
    activityType?: (typeof activityTypeEnum.enumValues)[number] | null;
    exercises?: Array<{
      id: string;
      name: string;
      sets: Array<{
        id: string;
        reps: number;
        weight: number;
      }>;
    }> | null;
  }>,
) {
  const result = await db.insert(workout).values(workouts).returning();
  return result;
}

export async function insertWeeklySchedules(
  schedules: Array<{
    id: string;
    planId: string;
    weekNumber: number;
    workoutId: string;
  }>,
) {
  const result = await db.insert(weeklySchedule).values(schedules).returning();
  return result;
}
export async function updateWorkoutStatus(
  workoutId: string,
  status: (typeof workoutStatusEnum.enumValues)[number],
) {
  const result = await db
    .update(workout)
    .set({ status })
    .where(eq(workout.id, workoutId));
  return result;
}
export async function bookClass(workoutId: string, date: Date) {
  const result = await db
    .update(workout)
    .set({ isBooked: true, bookedDate: date })
    .where(eq(workout.id, workoutId));
  return result;
}

export async function insertAiChatMessages(data: NewAiChatMessages) {
  const result = await db.insert(AiChatMessages).values(data).returning();
  return result[0]!;
}

export async function insertAiSystemPrompt(data: NewAiSystemPrompt) {
  const result = await db.insert(AiSystemPrompt).values(data).returning();
  return result[0]!;
}

export async function updateAiSystemPrompt(
  id: string,
  data: NewAiSystemPrompt,
) {
  const result = await db
    .update(AiSystemPrompt)
    .set(data)
    .where(eq(AiSystemPrompt.id, id))
    .returning();
  return result[0]!;
}

export async function deleteWorkout(workoutId: string) {
  const result = await db.delete(workout).where(eq(workout.id, workoutId));
  return result;
}

// New mutations for workout plan management
export async function updateWorkout(
  workoutId: string,
  data: {
    name?: string;
    instructor?: string;
    duration?: number;
    description?: string;
    level?: string;
    type?: (typeof workoutTypeEnum.enumValues)[number];
    status?: (typeof workoutStatusEnum.enumValues)[number];
    isBooked?: boolean;
    bookedDate?: Date | null;
    classId?: string | null;
    activityType?: (typeof activityTypeEnum.enumValues)[number] | null;
  },
) {
  const result = await db
    .update(workout)
    .set(data)
    .where(eq(workout.id, workoutId))
    .returning();
  return result[0];
}

export async function updateWeeklySchedule(
  scheduleId: string,
  data: {
    weekNumber?: number;
    workoutId?: string;
  },
) {
  const result = await db
    .update(weeklySchedule)
    .set(data)
    .where(eq(weeklySchedule.id, scheduleId))
    .returning();
  return result[0];
}

export async function deleteWeeklySchedule(scheduleId: string) {
  const result = await db
    .delete(weeklySchedule)
    .where(eq(weeklySchedule.id, scheduleId));
  return result;
}

export async function insertWeeklySchedule(data: {
  id: string;
  planId: string;
  weekNumber: number;
  workoutId: string;
}) {
  const result = await db.insert(weeklySchedule).values(data).returning();
  return result[0];
}

export async function deletePersonalTrainerInteraction(userId: string) {
  const result = await db
    .delete(AiChatMessages)
    .where(eq(AiChatMessages.userId, userId));
  return result;
}

// Notification mutations
export async function insertNotification(
  data: NewNotification,
): Promise<Notification> {
  const result = await db.insert(notifications).values(data).returning();
  return result[0]!;
}

export async function updateNotification(
  id: string,
  data: Partial<NewNotification>,
): Promise<Notification | null> {
  const result = await db
    .update(notifications)
    .set(data)
    .where(eq(notifications.id, id))
    .returning();
  return result[0] ?? null;
}

export async function markNotificationAsSent(
  id: string,
  deliveryStatus: "sent" | "failed" = "sent",
): Promise<Notification | null> {
  const result = await db
    .update(notifications)
    .set({
      sent: deliveryStatus === "sent",
      sentAt: new Date(),
      deliveryStatus: deliveryStatus,
    })
    .where(eq(notifications.id, id))
    .returning();
  return result[0] ?? null;
}

export async function markNotificationAsDelivered(
  userId: string,
  message: string,
  deliveryStatus: "sent" | "failed" = "sent",
): Promise<Notification | null> {
  // Find the most recent unsent notification for this user with matching message
  const result = await db
    .update(notifications)
    .set({
      sent: deliveryStatus === "sent",
      sentAt: new Date(),
      deliveryStatus: deliveryStatus,
    })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.body, message),
        eq(notifications.sent, false),
      ),
    )
    .returning();
  return result[0] ?? null;
}

export async function deleteNotification(id: string): Promise<void> {
  await db.delete(notifications).where(eq(notifications.id, id));
}

export async function deleteNotificationsByUserId(
  userId: string,
): Promise<void> {
  await db.delete(notifications).where(eq(notifications.userId, userId));
}

// Push subscription mutations
export async function insertPushSubscription(
  data: NewPushSubscription,
): Promise<PushSubscription> {
  const result = await db.insert(pushSubscriptions).values(data).returning();
  return result[0]!;
}

export async function updatePushSubscription(
  id: string,
  data: Partial<NewPushSubscription>,
): Promise<PushSubscription | null> {
  const result = await db
    .update(pushSubscriptions)
    .set(data)
    .where(eq(pushSubscriptions.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deletePushSubscription(id: string): Promise<void> {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, id));
}

export async function deletePushSubscriptionByEndpoint(
  endpoint: string,
): Promise<void> {
  await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function deletePushSubscriptionsByUserId(
  userId: string,
): Promise<void> {
  await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));
}

export async function upsertPushSubscription(
  data: NewPushSubscription,
): Promise<PushSubscription> {
  const result = await db
    .insert(pushSubscriptions)
    .values(data)
    .onConflictDoUpdate({
      target: pushSubscriptions.userId,
      set: {
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        createdAt: new Date(),
      },
    })
    .returning();
  return result[0]!;
}

// Notification Preferences mutations
export async function upsertNotificationPreferences(
  data: NewNotificationPreferences,
): Promise<NotificationPreferences> {
  const result = await db
    .insert(notificationPreferences)
    .values(data)
    .onConflictDoUpdate({
      target: notificationPreferences.userId,
      set: {
        enabledTypes: data.enabledTypes,
        updatedAt: new Date(),
      },
    })
    .returning();
  return result[0]!;
}

export async function deleteNotificationPreferences(
  userId: string,
): Promise<void> {
  await db
    .delete(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId));
}

// Pilates Video mutations
export type NewPilatesVideo = {
  title: string;
  summary: string;
  description: string;
  difficulty: string;
  duration: number;
  equipment: string;
  pilatesStyle: string;
  classType: string;
  focusArea: string;
  targetedMuscles: string;
  intensity: number;
  modifications: boolean;
  beginnerFriendly: boolean;
  tags: string[];
  exerciseSequence: string[];
  videoUrl: string;
  muxAssetId?: string | null;
  mux_playback_id?: string | null;
  instructor?: string | null;
};

export async function insertPilatesVideo(data: NewPilatesVideo) {
  // Log the data being inserted for debugging
  console.log("Inserting pilates video with data:", {
    muxAssetId: data.muxAssetId,
    mux_playback_id: data.mux_playback_id,
    tags: data.tags,
    exerciseSequence: data.exerciseSequence,
  });

  const result = await db.insert(PilatesVideos).values(data).returning();
  return result[0]!;
}

// Draft operations
export async function insertOrUpdateClassDraft(data: {
  userId: string;
  sessionId: string;
  muxAssetId?: string;
  muxPlaybackId?: string;
  chatHistory?: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  extractedData?: any;
}) {
  const result = await db
    .insert(classDrafts)
    .values(data)
    .onConflictDoUpdate({
      target: [classDrafts.userId, classDrafts.sessionId],
      set: {
        muxAssetId: data.muxAssetId,
        muxPlaybackId: data.muxPlaybackId,
        chatHistory: data.chatHistory,
        extractedData: data.extractedData,
        updatedAt: new Date(),
      },
    })
    .returning();
  return result[0]!;
}

export async function getClassDraft(userId: string, sessionId: string) {
  const result = await db
    .select()
    .from(classDrafts)
    .where(
      and(eq(classDrafts.userId, userId), eq(classDrafts.sessionId, sessionId)),
    )
    .limit(1);
  return result[0] || null;
}

export async function deleteClassDraft(userId: string, sessionId: string) {
  await db
    .delete(classDrafts)
    .where(
      and(eq(classDrafts.userId, userId), eq(classDrafts.sessionId, sessionId)),
    );
}
