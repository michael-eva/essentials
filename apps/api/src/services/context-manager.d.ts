import type { WorkoutTracking, Workout } from "../drizzle/src/db/queries";
export type completedWorkout = {
    workout: Workout | null;
    workoutTracking: WorkoutTracking;
};
export type UserContext = {
    profile: {
        name: string | null;
        age: number | null;
        height: number | null;
        weight: number | null;
        gender: string | null;
        fitnessLevel: string | null;
        exercises: string[] | null;
        otherExercises: string[] | null;
        exerciseFrequency: string | null;
        sessionLength: string | null;
        fitnessGoals: string[] | null;
        goalTimeline: string | null;
        specificGoals: string | null;
        pilatesExperience: boolean | null;
        pilatesDuration: string | null;
        studioFrequency: string | null;
        sessionPreference: string | null;
        apparatusPreference: string[] | null;
        customApparatus: string | null;
        motivation: string[] | null;
        otherMotivation: string[] | null;
        progressTracking: string[] | null;
        otherProgressTracking: string[] | null;
        health: {
            injuries: boolean | null;
            injuriesDetails: string | null;
            recentSurgery: boolean | null;
            surgeryDetails: string | null;
            chronicConditions: string[] | null;
            otherHealthConditions: string[] | null;
            pregnancy: string | null;
        };
    };
    recentActivity: {
        recentWorkouts: completedWorkout[];
        consistency: {
            weeklyAverage: number;
            monthlyAverage: number;
            streak: number;
        };
    };
    progress: {
        goalProgress: Record<string, number>;
        improvements: string[];
        challenges: string[];
    };
    workoutPlan: {
        plannedWorkouts: Workout[];
    };
};
/**
 * Builds a comprehensive context object for AI interactions
 */
export declare function buildUserContext(userId: string, _timeRange?: {
    start: Date;
    end: Date;
}): Promise<UserContext>;
/**
 * Updates context with new workout data
 */
export declare function updateContextWithWorkout(userId: string, _newWorkout: WorkoutTracking): Promise<UserContext>;
/**
 * Gets relevant context for a specific interaction type
 */
export declare function getContextForInteraction(userId: string, interactionType: "workout_feedback" | "progress_check" | "goal_setting" | "general"): Promise<Partial<UserContext>>;
//# sourceMappingURL=context-manager.d.ts.map