import type { PersonalTrainerInteraction, WorkoutTracking } from "../drizzle/src/db/queries";
import { z } from "zod";
import type { UserContext } from "./context-manager";
declare const GeneratedWorkoutPlanResponseSchema: z.ZodObject<{
    plan: z.ZodObject<{
        userId: z.ZodString;
        planName: z.ZodString;
        weeks: z.ZodNumber;
        savedAt: z.ZodString;
        archived: z.ZodDefault<z.ZodBoolean>;
        archivedAt: z.ZodNullable<z.ZodString>;
        isActive: z.ZodDefault<z.ZodBoolean>;
        startDate: z.ZodNullable<z.ZodString>;
        pausedAt: z.ZodNullable<z.ZodString>;
        resumedAt: z.ZodNullable<z.ZodString>;
        totalPausedDuration: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        planName: string;
        weeks: number;
        savedAt: string;
        archived: boolean;
        archivedAt: string | null;
        isActive: boolean;
        startDate: string | null;
        pausedAt: string | null;
        resumedAt: string | null;
        totalPausedDuration: number;
    }, {
        userId: string;
        planName: string;
        weeks: number;
        savedAt: string;
        archivedAt: string | null;
        startDate: string | null;
        pausedAt: string | null;
        resumedAt: string | null;
        archived?: boolean | undefined;
        isActive?: boolean | undefined;
        totalPausedDuration?: number | undefined;
    }>;
    workouts: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        instructor: z.ZodString;
        duration: z.ZodNumber;
        description: z.ZodString;
        level: z.ZodString;
        bookedDate: z.ZodNullable<z.ZodString>;
        type: z.ZodEnum<["class", "workout"]>;
        status: z.ZodDefault<z.ZodEnum<["completed", "not_completed", "not_recorded"]>>;
        isBooked: z.ZodDefault<z.ZodBoolean>;
        classId: z.ZodNullable<z.ZodNumber>;
        userId: z.ZodString;
        activityType: z.ZodNullable<z.ZodEnum<["run", "cycle", "swim", "walk", "hike", "rowing", "elliptical"]>>;
    }, "strip", z.ZodTypeAny, {
        duration: number;
        name: string;
        instructor: string;
        description: string;
        level: string;
        bookedDate: string | null;
        type: "class" | "workout";
        status: "completed" | "not_completed" | "not_recorded";
        isBooked: boolean;
        classId: number | null;
        userId: string;
        activityType: "run" | "cycle" | "swim" | "walk" | "hike" | "rowing" | "elliptical" | null;
    }, {
        duration: number;
        name: string;
        instructor: string;
        description: string;
        level: string;
        bookedDate: string | null;
        type: "class" | "workout";
        classId: number | null;
        userId: string;
        activityType: "run" | "cycle" | "swim" | "walk" | "hike" | "rowing" | "elliptical" | null;
        status?: "completed" | "not_completed" | "not_recorded" | undefined;
        isBooked?: boolean | undefined;
    }>, "many">;
    weeklySchedules: z.ZodArray<z.ZodObject<{
        planId: z.ZodString;
        weekNumber: z.ZodNumber;
        workoutId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        workoutId: string;
        planId: string;
        weekNumber: number;
    }, {
        workoutId: string;
        planId: string;
        weekNumber: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    weeklySchedules: {
        workoutId: string;
        planId: string;
        weekNumber: number;
    }[];
    plan: {
        userId: string;
        planName: string;
        weeks: number;
        savedAt: string;
        archived: boolean;
        archivedAt: string | null;
        isActive: boolean;
        startDate: string | null;
        pausedAt: string | null;
        resumedAt: string | null;
        totalPausedDuration: number;
    };
    workouts: {
        duration: number;
        name: string;
        instructor: string;
        description: string;
        level: string;
        bookedDate: string | null;
        type: "class" | "workout";
        status: "completed" | "not_completed" | "not_recorded";
        isBooked: boolean;
        classId: number | null;
        userId: string;
        activityType: "run" | "cycle" | "swim" | "walk" | "hike" | "rowing" | "elliptical" | null;
    }[];
}, {
    weeklySchedules: {
        workoutId: string;
        planId: string;
        weekNumber: number;
    }[];
    plan: {
        userId: string;
        planName: string;
        weeks: number;
        savedAt: string;
        archivedAt: string | null;
        startDate: string | null;
        pausedAt: string | null;
        resumedAt: string | null;
        archived?: boolean | undefined;
        isActive?: boolean | undefined;
        totalPausedDuration?: number | undefined;
    };
    workouts: {
        duration: number;
        name: string;
        instructor: string;
        description: string;
        level: string;
        bookedDate: string | null;
        type: "class" | "workout";
        classId: number | null;
        userId: string;
        activityType: "run" | "cycle" | "swim" | "walk" | "hike" | "rowing" | "elliptical" | null;
        status?: "completed" | "not_completed" | "not_recorded" | undefined;
        isBooked?: boolean | undefined;
    }[];
}>;
type GeneratedWorkoutPlanResponse = z.infer<typeof GeneratedWorkoutPlanResponseSchema>;
export declare function generateAIResponse(userInput: string, context: UserContext): Promise<GeneratedWorkoutPlanResponse>;
/**
 * Analyzes user progress based on their interactions and workout history
 */
export declare function analyzeProgress(userId: string, timeRange: {
    start: Date;
    end: Date;
}): Promise<{
    progressMetrics: {
        consistency: number;
        goalProgress: Record<string, number>;
        improvements: string[];
        challenges: string[];
    };
    recommendations: {
        workoutAdjustments: string[];
        focusAreas: string[];
        nextSteps: string[];
    };
}>;
/**
 * Generates personalized follow-up questions based on user's progress and context
 */
export declare function generateFollowUpQuestions(userId: string, context: {
    lastInteraction: PersonalTrainerInteraction;
    recentWorkouts: WorkoutTracking[];
    currentGoals: string[];
}): Promise<{
    questions: string[];
    purpose: "progress_check" | "goal_adjustment" | "motivation" | "feedback";
    priority: "high" | "medium" | "low";
}[]>;
/**
 * Updates user profile based on interaction analysis
 */
export declare function updateUserProfile(userId: string, interaction: PersonalTrainerInteraction): Promise<{
    updatedPreferences: Record<string, string>;
    newGoals: string[];
    removedGoals: string[];
}>;
/**
 * Generates a summary of the user's progress and recommendations
 */
export declare function generateProgressReport(userId: string, timeRange: {
    start: Date;
    end: Date;
}): Promise<{
    summary: string;
    achievements: string[];
    challenges: string[];
    recommendations: {
        shortTerm: string[];
        longTerm: string[];
    };
    nextSteps: string[];
}>;
export {};
//# sourceMappingURL=personal-trainer.d.ts.map