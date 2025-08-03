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

    // Create a map to store original workout IDs and their week-specific instances
    const workoutInstanceMap = new Map<string, string>();
    const allWorkoutsToInsert: Array<{
      id: string;
      name: string;
      instructor: string;
      duration: number;
      description: string;
      level: string;
      type: "workout" | "class";
      status: "completed" | "not_completed" | "not_recorded";
      isBooked: boolean;
      userId: string;
      classId?: string;
      activityType?:
        | "run"
        | "cycle"
        | "swim"
        | "walk"
        // | "hike"
        // | "rowing"
        // | "elliptical"
        | null;
      exercises?: Array<{
        id: string;
        name: string;
        sets: Array<{
          id: string;
          reps: number;
          weight: number;
        }>;
      }> | null;
    }> = [];

    // Process and create unique workout instances for each week
    console.log("🏋️ Processing workouts and creating week-specific instances");
    
    // First, validate that all schedule workout IDs exist in the workouts array
    const workoutIds = new Set(generatedPlan.workouts.map(w => w.id));
    const invalidSchedules = generatedPlan.weeklySchedules.filter(
      schedule => !workoutIds.has(schedule.workoutId)
    );
    
    if (invalidSchedules.length > 0) {
      console.error("❌ Invalid weekly schedules found:");
      console.error("Available workout IDs:", Array.from(workoutIds));
      console.error("Invalid schedule workout IDs:", invalidSchedules.map(s => s.workoutId));
      throw new Error(
        `AI generated weekly schedules with invalid workout IDs: ${invalidSchedules.map(s => s.workoutId).join(", ")}. Available workout IDs: ${Array.from(workoutIds).join(", ")}`
      );
    }

    for (const schedule of generatedPlan.weeklySchedules) {
      const originalWorkout = generatedPlan.workouts.find(
        (w) => w.id === schedule.workoutId,
      );
      // This should never happen now due to validation above, but keeping as safety check
      if (!originalWorkout) {
        console.warn(
          `⚠️ Workout not found for schedule: ${schedule.workoutId}`,
        );
        continue;
      }

      // Create a unique workout instance for this week
      const weekSpecificWorkoutId = uuidv4();
      workoutInstanceMap.set(
        `${schedule.workoutId}-week-${schedule.weekNumber}`,
        weekSpecificWorkoutId,
      );

      const weekSpecificWorkout = {
        ...originalWorkout,
        id: weekSpecificWorkoutId,
        status: originalWorkout.status ?? "not_recorded",
        isBooked: originalWorkout.isBooked ?? false,
        classId:
          originalWorkout.classId === null
            ? undefined
            : originalWorkout.classId,
        activityType:
          originalWorkout.activityType === null
            ? undefined
            : originalWorkout.activityType,
        userId: userId,
        // Add week information to the workout name for clarity
        name: `${originalWorkout.name} (Week ${schedule.weekNumber})`,
      };

      allWorkoutsToInsert.push(weekSpecificWorkout);
    }

    // Insert all workout instances
    await insertWorkouts(allWorkoutsToInsert);

    // Update weekly schedules to use the new workout instance IDs
    const weeklySchedulesWithIds = generatedPlan.weeklySchedules.map(
      (schedule) => {
        const weekSpecificWorkoutId = workoutInstanceMap.get(
          `${schedule.workoutId}-week-${schedule.weekNumber}`,
        );
        if (!weekSpecificWorkoutId) {
          console.error("❌ Workout instance mapping failed:");
          console.error("Looking for mapping key:", `${schedule.workoutId}-week-${schedule.weekNumber}`);
          console.error("Available mappings:", Array.from(workoutInstanceMap.keys()));
          throw new Error(
            `No workout instance found for ${schedule.workoutId} in week ${schedule.weekNumber}. Available mappings: ${Array.from(workoutInstanceMap.keys()).join(", ")}`
          );
        }

        return {
          id: uuidv4(),
          planId: plan.id,
          weekNumber: schedule.weekNumber,
          workoutId: weekSpecificWorkoutId,
        };
      },
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
