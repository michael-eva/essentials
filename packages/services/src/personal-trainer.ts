// Personal Trainer Service - Core business logic for AI workout plan generation
import { z } from "zod";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { UserContext } from "./context-manager";

const openai = new OpenAI();

// Zod schemas for workout plan generation
const NewWorkoutPlanSchema = z.object({
  userId: z.string().uuid(),
  planName: z.string(),
  weeks: z.number().int(),
  savedAt: z.string().datetime(),
  archived: z.boolean().default(false),
  archivedAt: z.string().datetime().nullable(),
  isActive: z.boolean().default(false),
  startDate: z.string().datetime().nullable(),
  pausedAt: z.string().datetime().nullable(),
  resumedAt: z.string().datetime().nullable(),
  totalPausedDuration: z.number().int().default(0),
});

const NewWorkoutSchema = z.object({
  name: z.string(),
  instructor: z.string(),
  duration: z.number().int(),
  description: z.string(),
  level: z.string(),
  bookedDate: z.string().datetime().nullable(),
  type: z.enum(["class", "workout"]),
  status: z
    .enum(["completed", "not_completed", "not_recorded"])
    .default("not_recorded"),
  isBooked: z.boolean().default(false),
  classId: z.number().int().nullable(),
  userId: z.string().uuid(),
  activityType: z
    .enum(["run", "cycle", "swim", "walk", "hike", "rowing", "elliptical"])
    .nullable(),
});

const NewWeeklyScheduleSchema = z.object({
  planId: z.string().uuid(),
  weekNumber: z.number().int(),
  workoutId: z.string().uuid(),
});

const GeneratedWorkoutPlanResponseSchema = z.object({
  plan: NewWorkoutPlanSchema,
  workouts: z.array(NewWorkoutSchema),
  weeklySchedules: z.array(NewWeeklyScheduleSchema),
});

export type GeneratedWorkoutPlanResponse = z.infer<
  typeof GeneratedWorkoutPlanResponseSchema
>;

// Define interface for available classes data
interface AvailableClasses {
  pilates: any[];
  nonPilates: any[];
}

/**
 * Personal Trainer Service - handles AI workout plan generation and progress analysis
 */
export class PersonalTrainerService {
  constructor(private availableClasses: AvailableClasses) {}

  /**
   * Generates an AI workout plan based on user input and context
   */
  async generateWorkoutPlan(
    userInput: string,
    context: UserContext
  ): Promise<GeneratedWorkoutPlanResponse> {
    // Create a comprehensive prompt for the AI
    const systemPrompt = `You are a professional personal trainer and fitness expert. Your task is to generate a personalized workout plan based on the user's input, fitness level, goals, and available classes.

IMPORTANT DATE FORMAT REQUIREMENTS:
- All date fields (savedAt, archivedAt, startDate, pausedAt, resumedAt, bookedDate) must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
- Use the current date/time for savedAt: "${new Date().toISOString()}"
- Set archivedAt, startDate, pausedAt, resumedAt to null (they should be null for a new plan)
- Set bookedDate to null for workouts (they will be booked later)

Available Classes:
Pilates Classes: ${JSON.stringify(this.availableClasses.pilates, null, 2)}
Non-Pilates Classes: ${JSON.stringify(this.availableClasses.nonPilates, null, 2)}

Note the "type" field of all Pilates classes is "class" and the "type" field of all non-Pilates classes is "workout".

Relevant context about the user, that you should use to generate the workout plan:
- Name: ${context.profile.name ?? "Not specified"}
- Age: ${context.profile.age ?? "Not specified"}
- Height: ${context.profile.height ?? "Not specified"} cm
- Weight: ${context.profile.weight ?? "Not specified"} kg
- Gender: ${context.profile.gender ?? "Not specified"}
- Exercises: ${context.profile.exercises?.join(", ") ?? "Not specified"}
- Custom Exercises: ${context.profile.otherExercises?.join(", ") ?? "Not specified"}
- Fitness Level: ${context.profile.fitnessLevel ?? "Not specified"}
- Goals: ${context.profile.fitnessGoals?.join(", ") ?? "Not specified"}
- Workout Frequency (preference for how many workouts to assign to each week): ${context.profile.exerciseFrequency ?? "Not specified"}
- Session Length (per session): ${context.profile.sessionLength ?? "Not specified"}
- Pilates Experience: ${context.profile.pilatesExperience ? "Yes" : "No"}
- Studio Frequency (max number of workouts of type "class" - which is derived from the available Pilates classes - to assign to each week): ${context.profile.studioFrequency ?? "Not specified"}
- Session Preference: ${context.profile.sessionPreference ?? "Not specified"}
- Apparatus Preference: ${context.profile.apparatusPreference?.join(", ") ?? "Not specified"}
- Health Considerations: ${context.profile.health.injuries ? `Has injuries: ${context.profile.health.injuriesDetails}` : "No injuries reported"}
- Chronic Conditions: ${context.profile.health.chronicConditions?.join(", ") ?? "None"}
- Pregnancy: ${context.profile.health.pregnancy ?? "Not specified"}
- Recent Activity: ${context.recentActivity.recentWorkouts.length} workouts in the last 30 days
- Recent Workouts: ${
      context.recentActivity.recentWorkouts.length > 0
        ? context.recentActivity.recentWorkouts
            .slice(-10)
            .map(
              (workout) =>
                `Name: ${workout.workout?.name ?? "Unnamed"}, Activity Type: ${workout.workout?.activityType ?? "Unknown"}, Would Do Again: ${
                  workout.workoutTracking.wouldDoAgain ? "Yes" : "No"
                }, Duration: ${workout.workoutTracking.durationHours} hours ${workout.workoutTracking.durationMinutes} mins, Intensity: ${workout.workoutTracking.intensity}`
            )
            .join("; ")
        : "None yet"
    }
- Consistency: ${context.recentActivity.consistency.weeklyAverage} workouts per week, ${context.recentActivity.consistency.monthlyAverage} workouts per month, ${context.recentActivity.consistency.streak} days in a row
- Challenges: ${context.progress.challenges?.join(", ") ?? "Not specified"}
- Improvements: ${context.progress.improvements?.join(", ") ?? "Not specified"}
- Motivations: ${context.profile.motivation?.join(", ") ?? "Not specified"}
- Progress Tracking: ${context.profile.progressTracking?.join(", ") ?? "Not specified"}
- Other Progress Tracking: ${context.profile.otherProgressTracking?.join(", ") ?? "Not specified"}
- Other Motivations: ${context.profile.otherMotivation?.join(", ") ?? "Not specified"}

Generate a comprehensive workout plan for the user that takes into account their fitness level, goals, health considerations, and preferences.

Make sure the plan is realistic, progressive, and aligned with the user's context.

You should generate a plan that is 4 weeks long (meaning 4 weekly_schedules are to be created from week number 1 through 4).
`;

    console.log(`#########################`);
    console.log(systemPrompt);
    console.log(`#########################`);

    const response = await openai.responses.parse({
      model: "gpt-4o-2024-08-06",
      input: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: userInput,
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
        })
      ),
      weeklySchedules: parsedResponse.weeklySchedules,
    };

    return transformedResponse;
  }

  /**
   * Analyzes user progress based on their interactions and workout history
   */
  async analyzeProgress(
    userId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<{
    progressMetrics: {
      consistency: number; // 0-100
      goalProgress: Record<string, number>; // goal -> progress percentage
      improvements: string[];
      challenges: string[];
    };
    recommendations: {
      workoutAdjustments: string[];
      focusAreas: string[];
      nextSteps: string[];
    };
  }> {
    // TODO: Implement progress analysis
    // 1. Gather user's workout history
    // 2. Analyze consistency and patterns
    // 3. Compare against goals
    // 4. Identify improvements and challenges
    // 5. Generate recommendations

    return {
      progressMetrics: {
        consistency: 0,
        goalProgress: {},
        improvements: [],
        challenges: [],
      },
      recommendations: {
        workoutAdjustments: [],
        focusAreas: [],
        nextSteps: [],
      },
    };
  }

  /**
   * Generates personalized follow-up questions based on user's progress and context
   */
  async generateFollowUpQuestions(
    userId: string,
    context: {
      lastInteraction: any;
      recentWorkouts: any[];
      currentGoals: string[];
    }
  ): Promise<
    {
      questions: string[];
      purpose: "progress_check" | "goal_adjustment" | "motivation" | "feedback";
      priority: "high" | "medium" | "low";
    }[]
  > {
    // TODO: Implement follow-up question generation
    // 1. Analyze recent interactions and workouts
    // 2. Identify areas needing attention
    // 3. Generate relevant questions
    // 4. Prioritize questions based on importance

    return [];
  }

  /**
   * Updates user profile based on interaction analysis
   */
  async updateUserProfile(
    userId: string,
    interaction: any
  ): Promise<{
    updatedPreferences: Record<string, string>;
    newGoals: string[];
    removedGoals: string[];
  }> {
    // TODO: Implement profile updates
    // 1. Analyze interaction content
    // 2. Extract preferences and goals
    // 3. Update user profile accordingly
    // 4. Track changes for future reference

    return {
      updatedPreferences: {},
      newGoals: [],
      removedGoals: [],
    };
  }

  /**
   * Generates a summary of the user's progress and recommendations
   */
  async generateProgressReport(
    userId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<{
    summary: string;
    achievements: string[];
    challenges: string[];
    recommendations: {
      shortTerm: string[];
      longTerm: string[];
    };
    nextSteps: string[];
  }> {
    // TODO: Implement progress report generation
    // 1. Gather all relevant data
    // 2. Analyze progress and patterns
    // 3. Generate comprehensive report
    // 4. Provide actionable recommendations

    return {
      summary: "",
      achievements: [],
      challenges: [],
      recommendations: {
        shortTerm: [],
        longTerm: [],
      },
      nextSteps: [],
    };
  }
}

// Convenience function for backward compatibility
export async function generateAIResponse(
  userInput: string,
  context: UserContext,
  availableClasses: AvailableClasses
): Promise<GeneratedWorkoutPlanResponse> {
  const service = new PersonalTrainerService(availableClasses);
  return service.generateWorkoutPlan(userInput, context);
}
