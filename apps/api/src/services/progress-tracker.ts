// API Adapter for Progress Tracker Service
import {
  ProgressTrackerService,
  trackWorkoutProgress as trackWorkoutProgressShared,
  getProgressData as getProgressDataShared,
  getLatestProgress as getLatestProgressShared,
  type ProgressMetrics,
} from "@essentials/services";
import {
  getProgressTracking,
  getLatestProgressTracking,
  getWorkoutTracking,
} from "../drizzle/src/db/queries";
import { insertProgressTracking } from "../drizzle/src/db/mutations";

// Create dependencies object for the shared service
const progressTrackingDeps = {
  getProgressTracking,
  getLatestProgressTracking,
  getWorkoutTracking: async (
    userId: string,
    timeRange: { start: Date; end: Date }
  ) => {
    const workouts = await getWorkoutTracking(userId, timeRange);
    return workouts.map((workout) => ({
      ...workout,
      durationHours: workout.durationHours ?? undefined,
      durationMinutes: workout.durationMinutes ?? undefined,
      intensity: workout.intensity ?? undefined,
      notes: workout.notes ?? undefined,
      wouldDoAgain: workout.wouldDoAgain ?? undefined,
    }));
  },
  insertProgressTracking: async (data: any) => {
    await insertProgressTracking(data);
  },
};

// Create service instance
const progressTrackerService = new ProgressTrackerService(progressTrackingDeps);

// Export adapted functions
export async function trackWorkoutProgress(
  userId: string,
  workout: {
    id: string;
    date: string | Date;
    durationHours?: number;
    durationMinutes?: number;
    intensity?: number;
    activityType?: string | null;
    notes?: string | null;
    wouldDoAgain?: boolean;
  }
): Promise<void> {
  // Convert date to string if it's a Date object
  const workoutWithStringDate = {
    ...workout,
    date:
      typeof workout.date === "string"
        ? workout.date
        : workout.date.toISOString(),
  };
  return progressTrackerService.trackWorkoutProgress(
    userId,
    workoutWithStringDate
  );
}

export async function getProgressData(
  userId: string,
  timeRange: { start: Date; end: Date }
): Promise<any[]> {
  return progressTrackerService.getProgressData(userId, timeRange);
}

export async function getLatestProgress(userId: string): Promise<any> {
  return progressTrackerService.getLatestProgress(userId);
}

// Re-export types
export type { ProgressMetrics };

// Backward compatibility
export {
  trackWorkoutProgressShared,
  getProgressDataShared,
  getLatestProgressShared,
};
