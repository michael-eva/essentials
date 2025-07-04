import { v4 as uuidv4 } from "uuid";
import { generateWorkoutPlanAI } from "./plan-generator";
import { buildUserContext } from "./context-manager";
import {
  insertWorkoutPlan,
  insertWorkouts,
  insertWeeklySchedules,
  deactivateAllUserPlans,
} from "@/drizzle/src/db/mutations";
import type { TRPCError } from "@trpc/server";

export interface GenerateWorkoutPlanOptions {
  userId: string;
  userPrompt?: string;
  throwOnError?: boolean;
}

export interface GenerateWorkoutPlanResult {
  success: boolean;
  planId?: string;
  error?: string;
  errorCode?: string;
}

/**
 * Shared function to generate and insert a workout plan into the database
 * Used by both AI chat tools and TRPC endpoints
 */
export async function generateAndInsertWorkoutPlan({
  userId,
  userPrompt,
  throwOnError = false,
}: GenerateWorkoutPlanOptions): Promise<GenerateWorkoutPlanResult> {
  try {
    console.log("🚀 Starting workout plan generation for user:", userId);

    const userContext = await buildUserContext(userId);
    const generatedPlan = await generateWorkoutPlanAI(userContext, userPrompt);

    // Deactivate all existing plans for this user first
    console.log("🔄 Deactivating all existing plans for user:", userId);
    await deactivateAllUserPlans(userId);

    // Create the typed plan with required fields
    const typedPlan = {
      ...generatedPlan.plan,
      id: uuidv4(),
      savedAt: new Date(),
      archivedAt: null,
      startDate: new Date(),
      pausedAt: null,
      resumedAt: null,
      userId: userId,
      isActive: true, // Set the new plan as active
    };

    // Insert the workout plan
    const plan = await insertWorkoutPlan(typedPlan);
    console.log("💾 Plan inserted into database:", { planId: plan.id });

    // Process and insert workouts
    console.log("🏋️ Processing workouts");
    const workoutsWithIds = generatedPlan.workouts.map((workout) => ({
      ...workout,
      status: workout.status ?? "not_recorded",
      isBooked: workout.isBooked ?? false,
      classId: workout.classId === null ? undefined : workout.classId,
      activityType:
        workout.activityType === null ? undefined : workout.activityType,
      userId: userId,
    }));

    await insertWorkouts(workoutsWithIds);

    // Insert weekly schedules
    const weeklySchedulesWithIds = generatedPlan.weeklySchedules.map(
      (schedule) => ({
        id: uuidv4(),
        planId: plan.id,
        weekNumber: schedule.weekNumber,
        workoutId: schedule.workoutId,
      }),
    );

    await insertWeeklySchedules(weeklySchedulesWithIds);

    console.log("✅ All database operations completed successfully");

    return {
      success: true,
      planId: plan.id,
    };
  } catch (error) {
    console.error("❌ Error in generateAndInsertWorkoutPlan:", error);

    // Enhanced error logging
    if (error instanceof Error) {
      console.error("🔍 Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Check for specific error types
    let errorCode = "INTERNAL_SERVER_ERROR";
    if (
      error instanceof Error &&
      error.message.includes("Invalid time value")
    ) {
      errorCode = "BAD_REQUEST";
    }

    if (throwOnError) {
      throw error;
    }

    return {
      success: false,
      error: errorMessage,
      errorCode,
    };
  }
}
