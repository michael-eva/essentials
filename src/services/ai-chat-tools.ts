import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import {
  insertWeeklySchedules,
  insertWorkouts,
  updateWorkout,
  updateWorkoutPlan,
  updateWeeklySchedule,
  deleteWeeklySchedule,
  insertWeeklySchedule,
  deleteWorkout,
  deleteWorkoutPlan,
  getWeeklySchedulesByPlan,
  getWorkoutsByWeek,
} from "@/drizzle/src/db/mutations";
import { getActivePlan } from "@/drizzle/src/db/queries";
import { generateWorkoutPlanAI } from "./plan-generator";
import { buildUserContext, type UserContext } from "./context-manager";
import { v4 as uuidv4 } from "uuid";
import { insertWorkoutPlan } from "@/drizzle/src/db/mutations";
import { activityTypeEnum } from "@/drizzle/src/db/schema";

async function InsertAiWorkoutPlan({
  userId,
  userPrompt,
}: {
  userId: string;
  userPrompt?: string;
}) {
  const userContext = await buildUserContext(userId);
  const generatedPlan = await generateWorkoutPlanAI(userContext, userPrompt);

  const typedPLan = {
    ...generatedPlan.plan,
    id: uuidv4(),
    savedAt: new Date(),
    archivedAt: null,
    startDate: new Date(),
    pausedAt: null,
    resumedAt: null,
    userId: userId,
  };

  const plan = await insertWorkoutPlan(typedPLan);
  console.log("💾 Plan inserted into database:", { planId: plan.id });

  console.log("🏋️ Processing workouts");
  const workoutsWithIds = generatedPlan.workouts.map((workout) => ({
    ...workout,
    id: uuidv4(),
    status: workout.status ?? "not_recorded",
    isBooked: workout.isBooked ?? false,
    classId: workout.classId === null ? undefined : workout.classId,
    activityType:
      workout.activityType === null ? undefined : workout.activityType,
    userId: userId,
  }));

  const workouts = await insertWorkouts(workoutsWithIds);
  // Insert weekly schedules with correct workout IDs

  const weeklySchedulesWithIds = generatedPlan.weeklySchedules.map(
    (schedule, index) => {
      const workout = workouts[index % workouts.length];
      return {
        id: uuidv4(),
        planId: plan.id,
        weekNumber: schedule.weekNumber,
        workoutId: workout?.id ?? schedule.workoutId, // Use actual workout ID or fallback
        userId: userId,
      };
    },
  );
  await insertWeeklySchedules(weeklySchedulesWithIds);
}

export const createWorkoutPlanTool = tool(InsertAiWorkoutPlan, {
  name: "createWorkoutPlan",
  description: "Create a workout plan for the user",
  schema: z.object({
    userId: z.string(),
    userPrompt: z.string().optional(),
  }),
});

// Comprehensive workout plan management tool
async function ManageWorkoutPlan({
  userId,
  operation,
  planId,
  workoutId,
  scheduleId,
  weekNumber,
  workoutData,
  planData,
  scheduleData,
  searchTerm,
}: {
  userId: string;
  operation:
    | "update_workout"
    | "update_plan"
    | "update_schedule"
    | "add_workout_to_week"
    | "remove_workout_from_week"
    | "remove_workouts_by_type"
    | "replace_workout_in_week"
    | "create_and_replace_workout"
    | "delete_workout"
    | "delete_plan";
  planId?: string;
  workoutId?: string;
  scheduleId?: string;
  weekNumber?: number;
  workoutData?: {
    name?: string;
    instructor?: string;
    duration?: number;
    description?: string;
    level?: string;
    type?: "workout" | "class";
    status?: "completed" | "not_completed" | "not_recorded";
    isBooked?: boolean;
    bookedDate?: string;
    classId?: string;
    activityType?: (typeof activityTypeEnum.enumValues)[number];
  };
  planData?: {
    planName?: string;
    weeks?: number;
    startDate?: string;
    isActive?: boolean;
  };
  scheduleData?: {
    weekNumber?: number;
    workoutId?: string;
  };
  searchTerm?: string;
}) {
  console.log("🏋️ ManageWorkoutPlan called with:", {
    userId,
    operation,
    planId,
    workoutId,
    scheduleId,
    weekNumber,
    workoutData,
    planData,
    scheduleData,
    searchTerm,
  });

  try {
    console.log(`🔄 Starting operation: ${operation}`);

    // Helper function to resolve workout names to IDs and find active plan
    async function resolveWorkoutAndPlan() {
      console.log("🔍 Resolving workout and plan IDs...");

      // Get the user's active plan
      const activePlan = await getActivePlan(userId);
      if (!activePlan) {
        throw new Error("No active workout plan found for user");
      }

      console.log(
        `✅ Found active plan: ${activePlan.id} (${activePlan.planName})`,
      );

      // If workoutId looks like a name (not a UUID), try to find the workout by name
      let resolvedWorkoutId = workoutId;
      if (workoutId && !workoutId.includes("-")) {
        console.log(`🔍 Looking for workout by name: ${workoutId}`);
        const allWorkouts = activePlan.weeklySchedules.flatMap(
          (week) => week.items,
        );
        const foundWorkout = allWorkouts.find(
          (w) =>
            w.name.toLowerCase().includes(workoutId.toLowerCase()) ||
            workoutId.toLowerCase().includes(w.name.toLowerCase()),
        );

        if (foundWorkout) {
          resolvedWorkoutId = foundWorkout.id;
          console.log(
            `✅ Found workout: ${foundWorkout.name} (${foundWorkout.id})`,
          );
        } else {
          console.log(`❌ Workout not found by name: ${workoutId}`);
        }
      }

      return {
        planId: activePlan.id,
        workoutId: resolvedWorkoutId,
        activePlan,
      };
    }

    switch (operation) {
      case "update_workout":
        console.log(`📝 Updating workout: ${workoutId}`, workoutData);

        if (!workoutId || !workoutData) {
          console.error("❌ Missing required parameters for update_workout");
          throw new Error(
            "workoutId and workoutData are required for update_workout operation",
          );
        }

        // Convert string dates to Date objects if provided
        const processedWorkoutData = {
          ...workoutData,
          bookedDate: workoutData.bookedDate
            ? new Date(workoutData.bookedDate)
            : undefined,
        };

        console.log("🔄 Processed workout data:", processedWorkoutData);

        const updatedWorkout = await updateWorkout(
          workoutId,
          processedWorkoutData,
        );

        console.log("✅ Workout updated successfully:", updatedWorkout);

        return {
          success: true,
          message: `Workout "${updatedWorkout?.name || workoutId}" updated successfully`,
          data: updatedWorkout,
        };

      case "update_plan":
        console.log(`📋 Updating plan: ${planId}`, planData);

        if (!planId || !planData) {
          console.error("❌ Missing required parameters for update_plan");
          throw new Error(
            "planId and planData are required for update_plan operation",
          );
        }

        // Convert string dates to Date objects if provided
        const processedPlanData = {
          ...planData,
          startDate: planData.startDate
            ? new Date(planData.startDate)
            : undefined,
        };

        console.log("🔄 Processed plan data:", processedPlanData);

        const updatedPlan = await updateWorkoutPlan(planId, processedPlanData);

        console.log("✅ Plan updated successfully:", updatedPlan);

        return {
          success: true,
          message: `Workout plan updated successfully`,
          data: updatedPlan,
        };

      case "update_schedule":
        console.log(`📅 Updating schedule: ${scheduleId}`, scheduleData);

        if (!scheduleData) {
          console.error("❌ Missing required parameters for update_schedule");
          throw new Error(
            "scheduleData is required for update_schedule operation",
          );
        }

        // If scheduleId is not provided, try to find it by planId and weekNumber
        let targetScheduleId = scheduleId;
        if (
          !targetScheduleId &&
          planId &&
          scheduleData.weekNumber !== undefined
        ) {
          console.log(
            `🔍 Looking for schedule ID for plan ${planId}, week ${scheduleData.weekNumber}`,
          );
          const schedules = await getWeeklySchedulesByPlan(planId);
          const targetSchedule = schedules.find(
            (s) => s.weekNumber === scheduleData.weekNumber,
          );

          if (targetSchedule) {
            targetScheduleId = targetSchedule.id;
            console.log(`✅ Found schedule ID: ${targetScheduleId}`);
          } else {
            console.error(
              `❌ No schedule found for plan ${planId}, week ${scheduleData.weekNumber}`,
            );
            throw new Error(
              `No schedule found for week ${scheduleData.weekNumber}. Use add_workout_to_week instead.`,
            );
          }
        }

        if (!targetScheduleId) {
          console.error("❌ Missing scheduleId for update_schedule");
          throw new Error(
            "scheduleId is required for update_schedule operation",
          );
        }

        const updatedSchedule = await updateWeeklySchedule(
          targetScheduleId,
          scheduleData,
        );

        console.log("✅ Schedule updated successfully:", updatedSchedule);

        return {
          success: true,
          message: `Weekly schedule updated successfully`,
          data: updatedSchedule,
        };

      case "add_workout_to_week":
        console.log(
          `➕ Adding workout ${workoutId} to week ${weekNumber} in plan ${planId}`,
        );

        if (!workoutId || weekNumber === undefined) {
          console.error(
            "❌ Missing required parameters for add_workout_to_week",
          );
          throw new Error(
            "workoutId and weekNumber are required for add_workout_to_week operation",
          );
        }

        // Resolve plan ID if not provided
        let resolvedPlanId4 = planId || "";
        let resolvedWorkoutId4 = workoutId || "";
        let activePlan4;

        if (!resolvedPlanId4) {
          console.log("🔍 Resolving plan ID automatically...");
          const planData = await resolveWorkoutAndPlan();
          resolvedPlanId4 = planData.planId;
          activePlan4 = planData.activePlan;
          console.log(`✅ Using resolved plan ID: ${resolvedPlanId4}`);
        }

        // If workoutId looks like a name (not a UUID), try to find the workout by name
        if (!resolvedWorkoutId4.includes("-")) {
          console.log(`🔍 Looking for workout by name: ${resolvedWorkoutId4}`);
          if (!activePlan4) {
            const planData = await resolveWorkoutAndPlan();
            activePlan4 = planData.activePlan;
          }

          const allWorkouts = activePlan4.weeklySchedules.flatMap(
            (week) => week.items,
          );
          const foundWorkout = allWorkouts.find(
            (w) =>
              w.name.toLowerCase().includes(resolvedWorkoutId4.toLowerCase()) ||
              resolvedWorkoutId4.toLowerCase().includes(w.name.toLowerCase()),
          );

          if (foundWorkout) {
            resolvedWorkoutId4 = foundWorkout.id;
            console.log(
              `✅ Found existing workout: ${foundWorkout.name} (${foundWorkout.id})`,
            );
          } else {
            console.log(`❌ Workout not found by name: ${resolvedWorkoutId4}`);
            throw new Error(
              `Workout "${resolvedWorkoutId4}" not found. Use create_and_replace_workout to create a new workout.`,
            );
          }
        } else if (
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.exec(
            resolvedWorkoutId4,
          )
        ) {
          // If it's not a valid UUID format, it's probably a name
          console.log(`❌ Invalid UUID format: ${resolvedWorkoutId4}`);
          throw new Error(
            `"${resolvedWorkoutId4}" is not a valid workout ID. Use create_and_replace_workout to create a new workout.`,
          );
        }

        const newScheduleId = uuidv4();
        console.log("🆔 Generated new schedule ID:", newScheduleId);

        const newSchedule = await insertWeeklySchedule({
          id: newScheduleId,
          planId: resolvedPlanId4,
          weekNumber,
          workoutId: resolvedWorkoutId4,
        });

        console.log("✅ Workout added to week successfully:", newSchedule);

        return {
          success: true,
          message: `Workout added to week ${weekNumber} successfully`,
          data: newSchedule,
        };

      case "remove_workout_from_week":
        console.log(
          `➖ Removing workout from week via schedule: ${scheduleId}`,
        );

        if (!scheduleId) {
          console.error(
            "❌ Missing required parameters for remove_workout_from_week",
          );
          throw new Error(
            "scheduleId is required for remove_workout_from_week operation",
          );
        }

        await deleteWeeklySchedule(scheduleId);

        console.log("✅ Workout removed from week successfully");

        return {
          success: true,
          message: "Workout removed from week successfully",
        };

      case "replace_workout_in_week":
        console.log(
          `🔄 Replacing workout in week ${weekNumber} of plan ${planId}`,
        );

        if (weekNumber === undefined) {
          console.error(
            "❌ Missing required parameters for replace_workout_in_week",
          );
          throw new Error(
            "weekNumber is required for replace_workout_in_week operation",
          );
        }

        // Resolve plan and workout IDs
        const {
          planId: resolvedPlanId1,
          workoutId: resolvedWorkoutId,
          activePlan: activePlan1,
        } = await resolveWorkoutAndPlan();

        console.log(`🔄 Using resolved plan ID: ${resolvedPlanId1}`);
        console.log(`🔄 Using resolved workout ID: ${resolvedWorkoutId}`);

        // Find the existing schedule for this week
        console.log(
          `🔍 Finding existing schedule for plan ${resolvedPlanId1}, week ${weekNumber}`,
        );
        const schedules1 = await getWeeklySchedulesByPlan(resolvedPlanId1);
        const existingSchedule1 = schedules1.find(
          (s) => s.weekNumber === weekNumber,
        );

        if (!existingSchedule1) {
          console.error(`❌ No schedule found for week ${weekNumber}`);
          throw new Error(
            `No workout scheduled for week ${weekNumber}. Use add_workout_to_week instead.`,
          );
        }

        console.log(
          `✅ Found existing schedule: ${existingSchedule1.id} with workout: ${existingSchedule1.workoutId}`,
        );

        // If a new workoutId is provided, update the schedule
        if (resolvedWorkoutId) {
          const updatedSchedule1 = await updateWeeklySchedule(
            existingSchedule1.id,
            {
              workoutId: resolvedWorkoutId,
            },
          );

          console.log("✅ Workout replaced successfully:", updatedSchedule1);

          return {
            success: true,
            message: `Workout in week ${weekNumber} replaced successfully`,
            data: updatedSchedule1,
          };
        } else {
          console.error("❌ No new workoutId provided for replacement");
          throw new Error(
            "workoutId is required for replace_workout_in_week operation",
          );
        }

      case "remove_workouts_by_type":
        const searchTermToUse = searchTerm || workoutId;
        console.log(`🗑️ Removing workouts by type/name: ${searchTermToUse}`);

        if (!searchTermToUse) {
          console.error(
            "❌ Missing required parameters for remove_workouts_by_type",
          );
          throw new Error(
            "searchTerm or workoutId (workout type/name to search for) is required for remove_workouts_by_type operation",
          );
        }

        // Resolve plan ID
        const { planId: resolvedPlanId3, activePlan: activePlan3 } =
          await resolveWorkoutAndPlan();

        console.log(`🔄 Using resolved plan ID: ${resolvedPlanId3}`);

        // Find all schedules for this plan
        console.log(`🔍 Finding all schedules for plan ${resolvedPlanId3}`);
        const allSchedules = await getWeeklySchedulesByPlan(resolvedPlanId3);

        // Get all workouts in this plan
        const allWorkouts = activePlan3.weeklySchedules.flatMap(
          (week) => week.items,
        );

        // Find workouts that match the type/name (case insensitive)
        const searchTermLower = searchTermToUse.toLowerCase();
        const matchingWorkouts = allWorkouts.filter(
          (workout) =>
            workout.name.toLowerCase().includes(searchTermLower) ||
            workout.activityType?.toLowerCase().includes(searchTermLower) ||
            searchTermLower.includes(workout.name.toLowerCase()) ||
            (workout.activityType &&
              searchTermLower.includes(workout.activityType.toLowerCase())),
        );

        console.log(
          `🔍 Found ${matchingWorkouts.length} workouts matching "${searchTermToUse}":`,
          matchingWorkouts.map((w) => w.name),
        );

        if (matchingWorkouts.length === 0) {
          console.log(`❌ No workouts found matching "${searchTermToUse}"`);
          return {
            success: true,
            message: `No workouts found matching "${searchTermToUse}"`,
            data: { removedCount: 0 },
          };
        }

        // Find schedules that contain these workouts
        const matchingScheduleIds = allSchedules.filter((schedule) =>
          matchingWorkouts.some((workout) => workout.id === schedule.workoutId),
        );

        console.log(
          `🗑️ Removing ${matchingScheduleIds.length} schedules for matching workouts`,
        );

        // Remove all matching schedules
        const removalPromises = matchingScheduleIds.map((schedule) =>
          deleteWeeklySchedule(schedule.id),
        );

        await Promise.all(removalPromises);

        console.log("✅ Successfully removed all matching workouts");

        return {
          success: true,
          message: `Successfully removed ${matchingScheduleIds.length} ${searchTermToUse} workouts from your plan`,
          data: {
            removedCount: matchingScheduleIds.length,
            removedWorkouts: matchingWorkouts.map((w) => w.name),
          },
        };

      case "create_and_replace_workout":
        console.log(`🆕 Creating new workout and adding to week ${weekNumber}`);

        if (weekNumber === undefined || !workoutData) {
          console.error(
            "❌ Missing required parameters for create_and_replace_workout",
          );
          throw new Error(
            "weekNumber and workoutData are required for create_and_replace_workout operation",
          );
        }

        // Resolve plan ID
        const { planId: resolvedPlanId2, activePlan: activePlan2 } =
          await resolveWorkoutAndPlan();

        console.log(`🔄 Using resolved plan ID: ${resolvedPlanId2}`);

        // Create the new workout
        const newWorkoutId = uuidv4();
        console.log(`🆔 Generated new workout ID: ${newWorkoutId}`);

        const newWorkout = await insertWorkouts([
          {
            id: newWorkoutId,
            name: workoutData.name || "New Workout",
            instructor: workoutData.instructor || "AI Trainer",
            duration: workoutData.duration || 30,
            description: workoutData.description || "AI-generated workout",
            level: workoutData.level || "Intermediate",
            type: workoutData.type || "workout",
            status: "not_recorded",
            isBooked: false,
            userId: userId,
          },
        ]);

        console.log("✅ New workout created:", newWorkout[0]);

        // Find the existing schedule for this week
        console.log(
          `🔍 Finding existing schedule for plan ${resolvedPlanId2}, week ${weekNumber}`,
        );
        const schedules2 = await getWeeklySchedulesByPlan(resolvedPlanId2);
        const existingSchedule2 = schedules2.find(
          (s) => s.weekNumber === weekNumber,
        );

        if (!existingSchedule2) {
          console.error(`❌ No schedule found for week ${weekNumber}`);
          throw new Error(
            `No workout scheduled for week ${weekNumber}. Use add_workout_to_week instead.`,
          );
        }

        console.log(
          `✅ Found existing schedule: ${existingSchedule2.id} with workout: ${existingSchedule2.workoutId}`,
        );

        // Replace the workout in the schedule
        const updatedSchedule2 = await updateWeeklySchedule(
          existingSchedule2.id,
          {
            workoutId: newWorkoutId,
          },
        );

        console.log("✅ Workout replaced successfully:", updatedSchedule2);

        return {
          success: true,
          message: `Created new ${workoutData.name} workout and replaced it in week ${weekNumber}`,
          data: {
            newWorkout: newWorkout[0],
            updatedSchedule: updatedSchedule2,
          },
        };

      case "delete_workout":
        console.log(`🗑️ Deleting workout: ${workoutId}`);

        if (!workoutId) {
          console.error("❌ Missing required parameters for delete_workout");
          throw new Error("workoutId is required for delete_workout operation");
        }

        await deleteWorkout(workoutId);

        console.log("✅ Workout deleted successfully");

        return {
          success: true,
          message: "Workout deleted successfully",
        };

      case "delete_plan":
        console.log(`🗑️ Deleting plan: ${planId}`);

        if (!planId) {
          console.error("❌ Missing required parameters for delete_plan");
          throw new Error("planId is required for delete_plan operation");
        }

        await deleteWorkoutPlan(planId);

        console.log("✅ Plan deleted successfully");

        return {
          success: true,
          message: "Workout plan deleted successfully",
        };

      default:
        console.error(`❌ Unknown operation: ${operation}`);
        throw new Error(`Unknown operation: ${operation}`);
    }

    console.log("🎉 ManageWorkoutPlan completed successfully");
  } catch (error) {
    console.error("💥 Error in ManageWorkoutPlan:", error);
    return {
      success: false,
      message: `Failed to ${operation}: ${error instanceof Error ? error.message : "Unknown error"}`,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const manageWorkoutPlanTool = tool(ManageWorkoutPlan, {
  name: "manageWorkoutPlan",
  description:
    "Comprehensive tool for managing workout plans, workouts, and weekly schedules. Use 'create_and_replace_workout' to create a new workout and add it to a specific week (use this for adding new swimming workouts, cardio sessions, etc. - this is the preferred method for adding new workouts). Use 'add_workout_to_week' to add an existing workout to a specific week (requires valid workout UUID). Use 'replace_workout_in_week' when you want to replace with an existing workout ID. Use 'remove_workouts_by_type' to remove all workouts matching a type/name (e.g., 'running', 'run'). Can update workout details, modify weekly schedules, add/remove workouts from weeks, and manage plan metadata.",
  schema: z.object({
    userId: z.string().describe("The user ID who owns the workout plan"),
    operation: z
      .enum([
        "update_workout",
        "update_plan",
        "update_schedule",
        "add_workout_to_week",
        "remove_workout_from_week",
        "remove_workouts_by_type",
        "replace_workout_in_week",
        "create_and_replace_workout",
        "delete_workout",
        "delete_plan",
      ])
      .describe(
        "The type of operation to perform. Use 'create_and_replace_workout' to create a new workout and add it to a specific week (use this for adding new swimming workouts, cardio sessions, etc. - this is the preferred method for adding new workouts). Use 'replace_workout_in_week' to replace with an existing workout ID. Use 'remove_workouts_by_type' to remove all workouts matching a type/name (e.g., 'running', 'run').",
      ),
    planId: z
      .string()
      .optional()
      .describe("The workout plan ID (required for plan operations)"),
    workoutId: z
      .string()
      .optional()
      .describe(
        "The workout ID or name (required for workout operations, can be workout name like 'Swimming - 30 Laps')",
      ),
    scheduleId: z
      .string()
      .optional()
      .describe("The weekly schedule ID (required for schedule operations)"),
    weekNumber: z
      .number()
      .optional()
      .describe("The week number (required for add_workout_to_week)"),
    workoutData: z
      .object({
        name: z.string().optional(),
        instructor: z.string().optional(),
        duration: z.number().optional(),
        description: z.string().optional(),
        level: z.string().optional(),
        type: z.enum(["workout", "class"]).optional(),
        status: z
          .enum(["completed", "not_completed", "not_recorded"])
          .optional(),
        isBooked: z.boolean().optional(),
        bookedDate: z.string().optional(),
        classId: z.string().optional(),
        activityType: z
          .enum([
            "run",
            "cycle",
            "swim",
            "walk",
            "hike",
            "rowing",
            "elliptical",
            "workout",
          ])
          .optional(),
      })
      .optional()
      .describe("Workout data to update (for update_workout operation)"),
    planData: z
      .object({
        planName: z.string().optional(),
        weeks: z.number().optional(),
        startDate: z.string().optional(),
        isActive: z.boolean().optional(),
      })
      .optional()
      .describe("Plan data to update (for update_plan operation)"),
    scheduleData: z
      .object({
        weekNumber: z.number().optional(),
        workoutId: z.string().optional(),
      })
      .optional()
      .describe("Schedule data to update (for update_schedule operation)"),
    searchTerm: z
      .string()
      .optional()
      .describe(
        "Search term for finding workouts by type/name (for remove_workouts_by_type operation)",
      ),
  }),
});

// export const editWorkoutPlanTool = tool(insertWorkouts,
//   {
//     name: "editWorkoutPlan",
//     description: "Edit a workout plan for the user",
//     schema: z.array(
//       z.object({
//         id: z.string(),
//         name: z.string(),
//         instructor: z.string(),
//         duration: z.number(),
//         description: z.string(),
//         level: z.string(),
//         type: z.enum(["workout", "class"]),
//         status: z.enum(["completed", "not_completed", "not_recorded"]),
//         isBooked: z.boolean(),
//         userId: z.string(),
//         classId: z.string().optional(),
//       }),
//     ),
//   },
// );
