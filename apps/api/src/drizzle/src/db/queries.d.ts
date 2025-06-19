import { workout, workoutTracking, workoutPlan, weeklySchedule, onboarding, user, personalTrainerInteractions, progressTracking, AiChatMessages, AiSystemPrompt } from "./schema";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
export type Workout = InferSelectModel<typeof workout>;
export type WorkoutTracking = InferSelectModel<typeof workoutTracking>;
export type WorkoutPlan = InferSelectModel<typeof workoutPlan>;
export type WeeklySchedule = InferSelectModel<typeof weeklySchedule>;
export type ProgressTracking = InferSelectModel<typeof progressTracking>;
export type AiChatMessages = InferSelectModel<typeof AiChatMessages>;
export type AiSystemPrompt = InferSelectModel<typeof AiSystemPrompt>;
export type NewWorkout = InferInsertModel<typeof workout>;
export type NewWorkoutTracking = InferInsertModel<typeof workoutTracking>;
export type NewWorkoutPlan = InferInsertModel<typeof workoutPlan>;
export type NewWeeklySchedule = InferInsertModel<typeof weeklySchedule>;
export type NewOnboarding = InferInsertModel<typeof onboarding>;
export type NewAiChatMessages = InferInsertModel<typeof AiChatMessages>;
export type NewAiSystemPrompt = InferInsertModel<typeof AiSystemPrompt>;
export type Onboarding = InferSelectModel<typeof onboarding>;
export type User = InferSelectModel<typeof user>;
export type PersonalTrainerInteraction = InferSelectModel<typeof personalTrainerInteractions>;
export type NewPersonalTrainerInteraction = InferInsertModel<typeof personalTrainerInteractions>;
export type NewProgressTracking = InferInsertModel<typeof progressTracking>;
export declare function getUpcomingClasses(userId: string): Promise<(Workout & {
    tracking: WorkoutTracking | null;
})[]>;
export declare function getSupplementaryWorkouts(userId: string): Promise<(Workout & {
    tracking: WorkoutTracking | null;
})[]>;
export declare function getPreviousPlans(userId: string): Promise<(WorkoutPlan & {
    weeklySchedules: {
        weekNumber: number;
        items: Workout[];
    }[];
})[]>;
export declare function getActivePlan(userId: string): Promise<(WorkoutPlan & {
    weeklySchedules: {
        weekNumber: number;
        items: Workout[];
    }[];
}) | null>;
export declare function getWorkoutsToLog(userId: string): Promise<Workout[]>;
export declare function getActivityHistory(userId: string, limit?: number, offset?: number): Promise<WorkoutTracking[]>;
export declare function getActivityHistoryCount(userId: string): Promise<number>;
export declare function checkOnboardingCompletion(userId: string): Promise<boolean>;
export declare function getOnboardingData(userId: string): Promise<Onboarding | null>;
export declare function getUser(userId: string): Promise<User | null>;
export declare function getPersonalTrainerInteractions(userId: string, limit?: number, cursor?: string): Promise<{
    items: PersonalTrainerInteraction[];
    nextCursor?: string;
}>;
export declare function getPersonalTrainerInteraction(id: string): Promise<PersonalTrainerInteraction | null>;
export declare function getWorkoutTracking(userId: string, timeRange: {
    start: Date;
    end: Date;
}): Promise<WorkoutTracking[]>;
export declare function getProgressTracking(userId: string, timeRange: {
    start: Date;
    end: Date;
}): Promise<ProgressTracking[]>;
export declare function getLatestProgressTracking(userId: string): Promise<ProgressTracking | null>;
export declare function getWorkoutById(workoutId: string): Promise<Workout | null>;
export declare function getMessages(userId: string): Promise<AiChatMessages[]>;
export declare function getAiSystemPrompt(userId: string): Promise<AiSystemPrompt | null>;
//# sourceMappingURL=queries.d.ts.map