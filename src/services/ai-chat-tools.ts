import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import {
  insertWeeklySchedules,
  insertWorkouts,
} from "@/drizzle/src/db/mutations";
import { generateWorkoutPlanAI } from "./plan-generator";
import { buildUserContext, type UserContext } from "./context-manager";
import { v4 as uuidv4 } from "uuid";
import { insertWorkoutPlan } from "@/drizzle/src/db/mutations";

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
