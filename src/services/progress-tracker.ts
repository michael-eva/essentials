import type {
  WorkoutTracking,
  ProgressTracking,
} from "@/drizzle/src/db/queries";
import {
  getProgressTracking,
  getLatestProgressTracking,
} from "@/drizzle/src/db/queries";
import { insertProgressTracking } from "@/drizzle/src/db/mutations";

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
export async function trackWorkoutProgress(
  userId: string,
  workout: WorkoutTracking,
): Promise<void> {
  const metrics = await calculateWorkoutMetrics(userId, workout);
  const { achievements, challenges } = await analyzeWorkoutProgress(
    workout,
    metrics,
  );

  await insertProgressTracking({
    userId,
    date: new Date(),
    type: workout.activityType === "pilates" ? "pilates" : "cardio",
    metrics,
    achievements,
    challenges,
    notes: workout.notes ?? null,
  });
}

/**
 * Calculates metrics for a specific workout
 */
async function calculateWorkoutMetrics(
  userId: string,
  workout: WorkoutTracking,
): Promise<ProgressMetrics> {
  // Get recent workouts for comparison
  const recentWorkouts = await getProgressTracking(userId, {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date(),
  });

  // Calculate duration in minutes
  const duration =
    (workout.durationHours ?? 0) * 60 + (workout.durationMinutes ?? 0);

  // Calculate intensity (placeholder - would need more data)
  const intensity = calculateIntensity(workout);

  // Calculate consistency based on recent workouts
  const consistency = calculateConsistency(recentWorkouts);

  // Calculate completion rate
  const completionRate = calculateCompletionRate(recentWorkouts);

  return {
    duration,
    intensity,
    consistency,
    completionRate,
    workoutCount: recentWorkouts.length + 1,
  };
}

/**
 * Analyzes workout progress and identifies achievements and challenges
 */
async function analyzeWorkoutProgress(
  workout: WorkoutTracking,
  metrics: ProgressMetrics,
): Promise<{ achievements: string[]; challenges: string[] }> {
  const achievements: string[] = [];
  const challenges: string[] = [];

  // Check for achievements
  if (metrics.duration > 30) {
    achievements.push("Completed a 30+ minute workout");
  }
  if (metrics.intensity > 7) {
    achievements.push("High-intensity workout completed");
  }
  if (metrics.consistency > 0.8) {
    achievements.push("Maintained consistent workout schedule");
  }

  // Identify challenges
  if (metrics.duration < 15) {
    challenges.push("Workout duration was shorter than recommended");
  }
  if (metrics.intensity < 3) {
    challenges.push("Workout intensity was lower than usual");
  }
  if (metrics.consistency < 0.5) {
    challenges.push("Inconsistent workout schedule");
  }

  return { achievements, challenges };
}

/**
 * Calculates workout intensity (placeholder implementation)
 */
function calculateIntensity(workout: WorkoutTracking): number {
  // TODO: Implement proper intensity calculation based on:
  // - Heart rate data
  // - Perceived exertion
  // - Workout type
  // - Duration
  return 5; // Placeholder: scale of 1-10
}

/**
 * Calculates workout consistency
 */
function calculateConsistency(recentWorkouts: ProgressTracking[]): number {
  if (recentWorkouts.length === 0) return 1;

  // Calculate consistency based on workout frequency
  const expectedWorkouts = 3; // Assuming 3 workouts per week
  const actualWorkouts = recentWorkouts.length;

  return Math.min(actualWorkouts / expectedWorkouts, 1);
}

/**
 * Calculates workout completion rate
 */
function calculateCompletionRate(recentWorkouts: ProgressTracking[]): number {
  if (recentWorkouts.length === 0) return 1;

  // Calculate completion rate based on workout duration
  const completedWorkouts = recentWorkouts.filter(
    (workout) => (workout.metrics as ProgressMetrics).duration >= 15,
  ).length;

  return completedWorkouts / recentWorkouts.length;
}

/**
 * Gets progress tracking data for a user within a date range
 */
export async function getProgressData(
  userId: string,
  timeRange: { start: Date; end: Date },
): Promise<ProgressTracking[]> {
  return getProgressTracking(userId, timeRange);
}

/**
 * Gets the latest progress tracking data for a user
 */
export async function getLatestProgress(
  userId: string,
): Promise<ProgressTracking | null> {
  return getLatestProgressTracking(userId);
}
