import postgres from "postgres";
import { workoutStatusEnum, workoutTypeEnum } from "./schema";
import type { NewWorkoutPlan, NewOnboarding, NewPersonalTrainerInteraction, NewProgressTracking, ProgressTracking, User, NewAiChatMessages, NewAiSystemPrompt } from "./queries";
export type WorkoutTrackingInput = {
    userId: string;
    workoutId?: string | null;
    activityType: string;
    date: Date;
    durationHours?: number | null;
    durationMinutes?: number | null;
    distance?: string | null;
    distanceUnit?: string | null;
    notes?: string | null;
    intensity?: number | null;
    name?: string | null;
    wouldDoAgain?: boolean | null;
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
export declare function insertWorkoutTracking(data: WorkoutTrackingInput): Promise<{
    date: Date;
    id: string;
    name: string | null;
    userId: string;
    activityType: string;
    workoutId: string | null;
    durationHours: number | null;
    durationMinutes: number | null;
    distance: string | null;
    distanceUnit: string | null;
    notes: string | null;
    intensity: number | null;
    wouldDoAgain: boolean | null;
    exercises: {
        id: string;
        name: string;
        sets: Array<{
            id: string;
            reps: number;
            weight: number;
        }>;
    }[] | null;
}>;
export declare function updateCompletedClass(id: string, status: (typeof workoutStatusEnum.enumValues)[number]): Promise<postgres.RowList<never[]>>;
export declare function updateWorkoutPlan(planId: string, data: {
    startDate?: Date | null;
    pausedAt?: Date | null;
    resumedAt?: Date | null;
    totalPausedDuration?: number;
    isActive?: boolean;
    planName?: string;
}): Promise<postgres.RowList<never[]>>;
export declare function deleteWorkoutPlan(planId: string): Promise<postgres.RowList<never[]>>;
export declare function insertOnboarding(data: NewOnboarding): Promise<postgres.RowList<never[]>>;
export declare function insertUser(data: User): Promise<postgres.RowList<never[]>>;
export declare function insertPersonalTrainerInteraction(data: NewPersonalTrainerInteraction): Promise<postgres.RowList<never[]>>;
export declare function insertProgressTracking(data: NewProgressTracking): Promise<ProgressTracking>;
export declare function insertWorkoutPlan(data: NewWorkoutPlan): Promise<{
    id: string;
    userId: string;
    planName: string;
    weeks: number;
    savedAt: Date;
    archived: boolean;
    archivedAt: Date | null;
    isActive: boolean;
    startDate: Date | null;
    pausedAt: Date | null;
    resumedAt: Date | null;
    totalPausedDuration: number;
    isAI: boolean;
    explanation: string | null;
}>;
export declare function insertWorkouts(workouts: Array<{
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
    classId?: number;
}>): Promise<{
    duration: number;
    id: string;
    name: string;
    instructor: string;
    description: string;
    level: string;
    bookedDate: Date | null;
    type: "class" | "workout";
    status: "completed" | "not_completed" | "not_recorded" | null;
    isBooked: boolean;
    classId: number | null;
    userId: string;
    activityType: "workout" | "run" | "cycle" | "swim" | "walk" | "hike" | "rowing" | "elliptical" | null;
}[]>;
export declare function insertWeeklySchedules(schedules: Array<{
    id: string;
    planId: string;
    weekNumber: number;
    workoutId: string;
}>): Promise<{
    id: string;
    workoutId: string;
    planId: string;
    weekNumber: number;
}[]>;
export declare function updateWorkoutStatus(workoutId: string, status: (typeof workoutStatusEnum.enumValues)[number]): Promise<postgres.RowList<never[]>>;
export declare function bookClass(workoutId: string, date: Date): Promise<postgres.RowList<never[]>>;
export declare function insertAiChatMessages(data: NewAiChatMessages): Promise<{
    role: "developer" | "user" | "assistant";
    id: string;
    userId: string;
    createdAt: Date;
    content: string;
    message: string;
}>;
export declare function insertAiSystemPrompt(data: NewAiSystemPrompt): Promise<{
    id: string;
    name: string;
    userId: string;
    createdAt: Date;
    prompt: string;
}>;
export declare function updateAiSystemPrompt(id: string, data: NewAiSystemPrompt): Promise<{
    id: string;
    userId: string;
    name: string;
    prompt: string;
    createdAt: Date;
}>;
//# sourceMappingURL=mutations.d.ts.map