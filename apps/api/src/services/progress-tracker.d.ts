import type { WorkoutTracking, ProgressTracking } from "../drizzle/src/db/queries";
export type ProgressMetrics = {
    duration: number;
    intensity: number;
    consistency: number;
    completionRate: number;
    workoutCount: number;
};
/**
 * Tracks progress for a specific workout
 */
export declare function trackWorkoutProgress(userId: string, workout: WorkoutTracking): Promise<void>;
/**
 * Gets progress tracking data for a user within a date range
 */
export declare function getProgressData(userId: string, timeRange: {
    start: Date;
    end: Date;
}): Promise<ProgressTracking[]>;
/**
 * Gets the latest progress tracking data for a user
 */
export declare function getLatestProgress(userId: string): Promise<ProgressTracking | null>;
//# sourceMappingURL=progress-tracker.d.ts.map