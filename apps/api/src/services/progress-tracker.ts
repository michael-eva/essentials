// API Adapter for Progress Tracker Service
import {
  ProgressTrackerService,
  trackWorkoutProgress as trackWorkoutProgressShared,
  getProgressData as getProgressDataShared,
  getLatestProgress as getLatestProgressShared,
  type ProgressMetrics
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
  getWorkoutTracking,
  insertProgressTracking,
};

// Create service instance
const progressTrackerService = new ProgressTrackerService(progressTrackingDeps);

// Export adapted functions
export async function trackWorkoutProgress(
  userId: string,
  workout: {
    id: string;
    date: string;
    durationHours?: number;
    durationMinutes?: number;
    intensity?: number;
    activityType?: string | null;
    notes?: string | null;
    wouldDoAgain?: boolean;
  }
): Promise<void> {
  return progressTrackerService.trackWorkoutProgress(userId, workout);
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
export { trackWorkoutProgressShared, getProgressDataShared, getLatestProgressShared };
