import { getPilatesClasses } from "@/drizzle/src/db/queries";

import { z } from "zod";
import { nonPilates } from "@/data";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { UserContext } from "./context-manager";
import {
  NewWorkoutSchema,
  GeneratedWorkoutPlanResponseSchema,
} from "@/lib/zodschemas/schemas";
import { formatUserContextForAI } from "./context-formatter";

type GeneratedWorkoutPlanResponse = z.infer<
  typeof GeneratedWorkoutPlanResponseSchema
>;

export async function generateWorkoutPlanAI(
  context: UserContext,
  userPrompt?: string,
): Promise<GeneratedWorkoutPlanResponse> {
  const openai = new OpenAI();

  const pilatesClasses = await getPilatesClasses();

  // get nonPilates and pilates as the possible classes for context for the AI to generate
  const availableClasses = {
    pilates: pilatesClasses,
    nonPilates: nonPilates,
  };
  // Create a comprehensive prompt for the AI
  const systemPrompt = `You are a professional personal trainer and fitness expert. Your task is to generate a personalized workout plan based on the user's input, fitness level, goals, and available classes.

Available Classes:
Pilates Classes: ${JSON.stringify(availableClasses.pilates, null, 2)}
Non-Pilates Classes: ${JSON.stringify(availableClasses.nonPilates, null, 2)}

Note the "type" field of all Pilates classes is "class" and the "type" field of all non-Pilates classes is "workout".

Relevant context about the user, that you should use to generate the workout plan:
${formatUserContextForAI(context)}


Generate a comprehensive workout plan for the user that takes into account their fitness level, goals, health considerations, and preferences.

IMPORTANT: 
1. For every workout of type 'workout', you MUST provide a detailed 'exercises' array. Each exercise should include a name, and a list of sets (with reps and weight if applicable). Do NOT just give a generic label like 'Full Body Workout'—the user must be able to see exactly what exercises to do, with sets and reps. For Pilates or class-based workouts (type 'class'), you may use the class description and do not need to provide an exercises array.

2. Each workout MUST have a unique 'id' field (UUID format). No two workouts should have the same ID. IMPORTANT: When creating class-based workouts (type 'class'), you should:
   - Generate a NEW unique UUID for the workout 'id' field
   - Set the 'classId' field to reference the existing Pilates class ID from the available classes
   - Do NOT reuse the existing class ID as the workout ID

3. Each weekly schedule should reference the exact workout ID from the workouts array.

4. IMPORTANT: You should create 3-4 unique workout definitions in the workouts array, and then reference these same workout IDs across different weeks in the weekly_schedules. The system will automatically create week-specific instances of these workouts to prevent completion conflicts.

EXAMPLE: If you want to include the "Abs, Arms & Booty" class (ID: d24df388-15c9-46f3-bf4a-98353784aa6c), create a workout like this:
{
  "id": "f393983b-4525-4f69-b1d4-7ce4e099c635", // NEW unique UUID
  "name": "Abs, Arms & Booty",
  "type": "class",
  "classId": "d24df388-15c9-46f3-bf4a-98353784aa6c", // Reference to existing class
  // ... other fields
}

Make sure the plan is realistic, progressive, and aligned with the user's context.

The plan length will be specified in the user's prompt.
`;

  console.log(`#########################`);
  console.log(systemPrompt);
  console.log(`#########################`);
  console.log(userPrompt);
  const response = await openai.responses.parse({
    model: "gpt-4o-2024-08-06",
    input: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: userPrompt
          ? `The user has also provided the following additional prompt to guide the workout plan: ${userPrompt}`
          : "",
      },
    ],
    text: {
      format: zodTextFormat(GeneratedWorkoutPlanResponseSchema, "workout_plan"),
    },
  });

  const parsedResponse = response.output_parsed;
  if (!parsedResponse) {
    throw new Error("Failed to parse AI response");
  }

  // Transform the response to match our expected types
  const transformedResponse: GeneratedWorkoutPlanResponse = {
    plan: {
      ...parsedResponse.plan,
      savedAt: parsedResponse.plan.savedAt,
      archived: parsedResponse.plan.archived ?? false,
      isActive: parsedResponse.plan.isActive ?? false,
      totalPausedDuration: parsedResponse.plan.totalPausedDuration ?? 0,
    },
    workouts: parsedResponse.workouts.map(
      (workout: z.infer<typeof NewWorkoutSchema>) => ({
        ...workout,
        isBooked: workout.isBooked ?? false,
        status: "not_recorded" as const,
        classId: workout.classId ?? null,
      }),
    ),
    weeklySchedules: parsedResponse.weeklySchedules,
  };

  return transformedResponse;
}
