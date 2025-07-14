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
  const combinedPrompt = `You are a professional personal trainer and fitness expert. Generate a personalised workout plan based on the following information:

## USER PREFERENCES & REQUIREMENTS
${userPrompt || "No specific preferences provided - create a balanced plan based on user context below."}

Relevant context about the user, that you should use to generate the workout plan:
${formatUserContextForAI(context)}

## AVAILABLE CLASSES
**Pilates Classes (type: "class"):**
${JSON.stringify(availableClasses.pilates, null, 2)}

**Non-Pilates Classes (type: "workout"):**
${JSON.stringify(availableClasses.nonPilates, null, 2)}

## GENERATION REQUIREMENTS
1. **Workout Details**: 
   - For every workout of type 'workout', provide a detailed 'exercises' array with name, sets, reps, and weight if applicable. Do NOT use generic labels like 'Full Body Workout'.
   - For cardio workouts, only use: ${availableClasses.nonPilates}. Specify duration and intensity level.
   - Only add cardio workouts if the user has selected to include them in the plan. This means that userPrompt explicitly calls for "WORKOUTS"

2. **Unique IDs**: Each workout MUST have a unique 'id' field (UUID format). For class-based workouts:
   - Generate a NEW unique UUID for the workout 'id' field
   - Set the 'classId' field to reference the existing class ID
   - Do NOT reuse the existing class ID as the workout ID

3. **Workout References**: Each weekly schedule should reference exact workout IDs from the workouts array.


**Example Class Workout:**
If including "Abs, Arms & Booty" class (ID: d24df388-15c9-46f3-bf4a-98353784aa6c):
{
  "id": "f393983b-4525-4f69-b1d4-7ce4e099c635", // NEW unique UUID
  "name": "Abs, Arms & Booty",
  "type": "class",
  "classId": "d24df388-15c9-46f3-bf4a-98353784aa6c", // Reference to existing class
  // ... other fields
}

**Example Cardio Workout:**
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", // NEW unique UUID
  "name": "Morning Run",
  "type": "workout",
  "activityType": "run",
  "duration": 30,
  "description": "Steady pace run, maintain conversation level intensity",
  "exercises": null
}

Generate a realistic, progressive plan aligned with the user's context and preferences.`;

  console.log(`#########################`);
  console.log(combinedPrompt);
  console.log(`#########################`);

  const response = await openai.responses.parse({
    model: "gpt-4o-2024-08-06",
    input: [{ role: "user", content: combinedPrompt }],
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
