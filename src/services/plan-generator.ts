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

  // Extract the number of weeks from user prompt
  const weekCountMatch = userPrompt?.match(/(\d+)(?:\s*weeks?|\s*-week)/i);
  const weekCount = weekCountMatch ? parseInt(weekCountMatch[1]!) : 1;

  // Create a comprehensive prompt for the AI
  const combinedPrompt = `You are a professional personal trainer and fitness expert. Generate a personalised workout plan based on the following information:

## USER PREFERENCES & REQUIREMENTS
${userPrompt || "No specific preferences provided - create a balanced plan based on user context below."}

Relevant context about the user, that you should use to generate the workout plan:
${formatUserContextForAI(context)}

## CRITICAL SAFETY ADAPTATIONS
Based on the user's health profile, you MUST follow these safety guidelines:

${context.profile.health.pregnancy === "yes" || context.profile.health.pregnancy === "currently pregnant" ? `
**PREGNANCY ADAPTATIONS (CRITICAL):**
- NEVER include high-intensity cardio or HIIT workouts
- Avoid supine (lying on back) exercises after first trimester
- Exclude exercises with twisting or deep abdominal work
- Focus on gentle, prenatal-safe Pilates classes only
- Limit workout intensity to light-moderate (max 6/10 intensity)
- Include more rest days and shorter session durations
- Recommend consulting healthcare provider before starting any new exercise
- Prioritize exercises that support posture and reduce back pain
${context.profile.health.pregnancyConsultedDoctor ? `- User has consulted doctor: ${context.profile.health.pregnancyConsultedDoctorDetails}` : "- IMPORTANT: Recommend consulting doctor before starting plan"}
` : ""}

${context.profile.health.injuries ? `
**INJURY ADAPTATIONS (CRITICAL):**
- Current injuries: ${context.profile.health.injuriesDetails}
- Modify or exclude exercises that could aggravate existing injuries
- Focus on gentle, rehabilitative movements
- Recommend lower impact alternatives
- Include proper warm-up and cool-down routines
- Suggest consulting a physical therapist if pain persists
` : ""}

${context.profile.health.recentSurgery ? `
**POST-SURGERY ADAPTATIONS (CRITICAL):**
- Recent surgery: ${context.profile.health.surgeryDetails}
- Follow post-surgical exercise guidelines
- Start with very gentle movements and progress slowly
- Avoid exercises that strain the surgical site
- Recommend medical clearance before beginning any program
` : ""}

${context.profile.health.chronicConditions && context.profile.health.chronicConditions.length > 0 ? `
**CHRONIC CONDITION ADAPTATIONS:**
- Conditions: ${context.profile.health.chronicConditions.join(", ")}
- Adapt intensity and duration based on condition limitations
- Include exercises that may help manage symptoms
- Monitor for any adverse reactions during workouts
` : ""}

## AVAILABLE CLASSES
**Pilates Classes (type: "class"):**
${JSON.stringify(availableClasses.pilates, null, 2)}

**Non-Pilates Classes (type: "workout"):**
${JSON.stringify(availableClasses.nonPilates, null, 2)}

## GENERATION REQUIREMENTS
1. **Safety First**: 
   - ALWAYS prioritize the safety adaptations listed above
   - If user has pregnancy or injuries, override any conflicting user preferences for safety
   - Include safety disclaimers in workout descriptions when appropriate

2. **Plan Duration**: 
   - Set the plan 'weeks' field to exactly ${weekCount}
   - Generate weekly schedules for ALL ${weekCount} weeks (weekNumber: 1, 2, 3, ..., ${weekCount})
   - Each week should have the requested activities distributed appropriately
   ${context.profile.health.pregnancy || context.profile.health.injuries || context.profile.health.recentSurgery ? "- Include more rest days and shorter sessions for safety" : ""}

3. **Workout Details**: 
   - For every workout with type: "workout" (cardio workouts), the activityType field MUST be one of: ${JSON.stringify(availableClasses.nonPilates)}
   - IMPORTANT: "workout" is NOT a valid activityType. Only use: run, cycle, swim, walk
   - For cardio workouts, specify duration and intensity level in the description
   ${context.profile.health.pregnancy ? "- For pregnant users: EXCLUDE all cardio workouts unless specifically walking at gentle pace" : ""}
   ${context.profile.health.injuries ? "- For users with injuries: Avoid high-impact cardio, prefer walking or swimming if appropriate" : ""}
   - Only add cardio workouts if the user has selected to include them in the plan. This means that userPrompt explicitly calls for "WORKOUTS"

4. **Unique IDs**: Each workout MUST have a unique 'id' field (UUID format). For class-based workouts:
   - Generate a NEW unique UUID for the workout 'id' field
   - Set the 'classId' field to reference the existing class ID
   - Do NOT reuse the existing class ID as the workout ID

5. **Weekly Schedules**: 
   - Create weekly schedule entries for ALL ${weekCount} weeks
   - Each weekly schedule should reference exact workout IDs from the workouts array
   - Distribute workouts across all weeks to create a progressive plan
   ${context.profile.health.pregnancy || context.profile.health.injuries ? "- Progress very gradually due to health considerations" : ""}


**Example Class Workout:**
If including "Abs, Arms & Booty" class (ID: d24df388-15c9-46f3-bf4a-98353784aa6c):
{
  "id": "f393983b-4525-4f69-b1d4-7ce4e099c635", // NEW unique UUID
  "name": "Abs, Arms & Booty",
  "type": "class",
  "classId": "d24df388-15c9-46f3-bf4a-98353784aa6c", // Reference to existing class
  // ... other fields
}

**Example Cardio Workouts:**
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", // NEW unique UUID
  "name": "Morning Run",
  "type": "workout",
  "activityType": "run", // MUST be: run, cycle, swim, or walk
  "duration": 30,
  "description": "Steady pace run, maintain conversation level intensity",
  "exercises": null
}

{
  "id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
  "name": "Evening Cycle",
  "type": "workout", 
  "activityType": "cycle", // MUST be: run, cycle, swim, or walk
  "duration": 45,
  "description": "Moderate intensity cycling session",
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
