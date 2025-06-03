import type {
  WorkoutTracking,
  ProgressTracking,
} from "@/drizzle/src/db/queries";
import {
  getProgressTracking,
  getLatestProgressTracking,
  getWorkoutTracking,
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
  // Get recent workouts for context
  const recentWorkouts = await getWorkoutTracking(userId, {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date(),
  });

  // Calculate metrics
  const metrics = await calculateWorkoutMetrics(
    userId,
    workout,
    recentWorkouts,
  );

  // Analyze progress
  const { achievements, challenges } = await analyzeWorkoutProgress(
    workout,
    metrics,
    recentWorkouts,
  );

  // Insert progress tracking entry
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
  recentWorkouts: WorkoutTracking[],
): Promise<ProgressMetrics> {
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
  recentWorkouts: WorkoutTracking[],
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

  // Check for streaks
  const streak = calculateStreak(recentWorkouts);
  if (streak >= 3) {
    achievements.push(`Maintained a ${streak}-day workout streak`);
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

  // Check for gaps in workout schedule
  const gaps = findWorkoutGaps(recentWorkouts);
  if (gaps.length > 0) {
    challenges.push(`Gaps in workout schedule: ${gaps.join(", ")}`);
  }

  return { achievements, challenges };
}

/**
 * Calculates workout intensity (placeholder implementation)
 */
function calculateIntensity(workout: WorkoutTracking): number {
  return workout.intensity ?? 5;
}

/**
 * Calculates workout consistency
 */
function calculateConsistency(recentWorkouts: WorkoutTracking[]): number {
  if (recentWorkouts.length === 0) return 1;

  // Calculate consistency based on workout frequency
  const expectedWorkouts = 3; // Assuming 3 workouts per week
  const actualWorkouts = recentWorkouts.length;

  return Math.min(actualWorkouts / expectedWorkouts, 1);
}

/**
 * Calculates workout completion rate
 */
function calculateCompletionRate(recentWorkouts: WorkoutTracking[]): number {
  if (recentWorkouts.length === 0) return 1;

  // Calculate completion rate based on workout duration
  const completedWorkouts = recentWorkouts.filter((workout) => {
    const duration =
      (workout.durationHours ?? 0) * 60 + (workout.durationMinutes ?? 0);
    return duration >= 15;
  }).length;

  return completedWorkouts / recentWorkouts.length;
}

/**
 * Calculates current workout streak
 */
function calculateStreak(workouts: WorkoutTracking[]): number {
  if (workouts.length === 0) return 0;

  // Sort workouts by date in descending order
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  let streak = 1;
  let currentDate = new Date(sortedWorkouts[0]!.date);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sortedWorkouts.length; i++) {
    const workoutDate = new Date(sortedWorkouts[i]!.date);
    workoutDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor(
      (currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (dayDiff === 1) {
      streak++;
      currentDate = workoutDate;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Finds gaps in workout schedule
 */
function findWorkoutGaps(workouts: WorkoutTracking[]): string[] {
  if (workouts.length < 2) return [];

  const gaps: string[] = [];
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  for (let i = 1; i < sortedWorkouts.length; i++) {
    const prevDate = new Date(sortedWorkouts[i - 1]!.date);
    const currDate = new Date(sortedWorkouts[i]!.date);
    const dayDiff = Math.floor(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (dayDiff > 3) {
      gaps.push(`${dayDiff} days`);
    }
  }

  return gaps;
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
