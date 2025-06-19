// Progress Tracker Service - Core business logic for progress tracking
export type ProgressMetrics = {
  duration: number;
  intensity: number;
  consistency: number;
  completionRate: number;
  workoutCount: number;
};

interface WorkoutData {
  id: string;
  date: string | Date;
  durationHours?: number;
  durationMinutes?: number;
  intensity?: number;
  activityType?: string | null;
  notes?: string | null;
  wouldDoAgain?: boolean;
}

interface ProgressTrackingDependencies {
  getProgressTracking: (userId: string, timeRange: { start: Date; end: Date }) => Promise<any[]>;
  getLatestProgressTracking: (userId: string) => Promise<any>;
  getWorkoutTracking: (userId: string, timeRange: { start: Date; end: Date }) => Promise<WorkoutData[]>;
  insertProgressTracking: (data: {
    userId: string;
    date: Date;
    type: string;
    metrics: ProgressMetrics;
    achievements: string[];
    challenges: string[];
    notes: string | null;
  }) => Promise<void>;
}

/**
 * Progress Tracker Service - handles all progress tracking operations
 */
export class ProgressTrackerService {
  constructor(private deps: ProgressTrackingDependencies) {}

  /**
   * Tracks progress for a specific workout
   */
  async trackWorkoutProgress(
    userId: string,
    workout: WorkoutData
  ): Promise<void> {
    // Get recent workouts for context
    const recentWorkouts = await this.deps.getWorkoutTracking(userId, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date(),
    });

    // Calculate metrics
    const metrics = await this.calculateWorkoutMetrics(
      userId,
      workout,
      recentWorkouts
    );

    // Analyze progress
    const { achievements, challenges } = await this.analyzeWorkoutProgress(
      workout,
      metrics,
      recentWorkouts
    );

    // Insert progress tracking entry
    await this.deps.insertProgressTracking({
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
  private async calculateWorkoutMetrics(
    userId: string,
    workout: WorkoutData,
    recentWorkouts: WorkoutData[]
  ): Promise<ProgressMetrics> {
    // Calculate duration in minutes
    const duration =
      (workout.durationHours ?? 0) * 60 + (workout.durationMinutes ?? 0);

    // Calculate intensity (placeholder - would need more data)
    const intensity = this.calculateIntensity(workout);

    // Calculate consistency based on recent workouts
    const consistency = this.calculateConsistency(recentWorkouts);

    // Calculate completion rate
    const completionRate = this.calculateCompletionRate(recentWorkouts);

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
  private async analyzeWorkoutProgress(
    workout: WorkoutData,
    metrics: ProgressMetrics,
    recentWorkouts: WorkoutData[]
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
    const streak = this.calculateStreak(recentWorkouts);
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
    const gaps = this.findWorkoutGaps(recentWorkouts);
    if (gaps.length > 0) {
      challenges.push(`Gaps in workout schedule: ${gaps.join(", ")}`);
    }

    return { achievements, challenges };
  }

  /**
   * Calculates workout intensity (placeholder implementation)
   */
  private calculateIntensity(workout: WorkoutData): number {
    return workout.intensity ?? 5;
  }

  /**
   * Calculates workout consistency
   */
  private calculateConsistency(recentWorkouts: WorkoutData[]): number {
    if (recentWorkouts.length === 0) return 1;

    // Calculate consistency based on workout frequency
    const expectedWorkouts = 3; // Assuming 3 workouts per week
    const actualWorkouts = recentWorkouts.length;

    return Math.min(actualWorkouts / expectedWorkouts, 1);
  }

  /**
   * Calculates workout completion rate
   */
  private calculateCompletionRate(recentWorkouts: WorkoutData[]): number {
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
  private calculateStreak(workouts: WorkoutData[]): number {
    if (workouts.length === 0) return 0;

    // Sort workouts by date in descending order
    const sortedWorkouts = [...workouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 1;
    let currentDate = new Date(sortedWorkouts[0]!.date);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i]!.date);
      workoutDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor(
        (currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
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
  private findWorkoutGaps(workouts: WorkoutData[]): string[] {
    if (workouts.length < 2) return [];

    const gaps: string[] = [];
    const sortedWorkouts = [...workouts].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 1; i < sortedWorkouts.length; i++) {
      const prevDate = new Date(sortedWorkouts[i - 1]!.date);
      const currDate = new Date(sortedWorkouts[i]!.date);
      const dayDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
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
  async getProgressData(
    userId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<any[]> {
    return this.deps.getProgressTracking(userId, timeRange);
  }

  /**
   * Gets the latest progress tracking data for a user
   */
  async getLatestProgress(userId: string): Promise<any> {
    return this.deps.getLatestProgressTracking(userId);
  }
}

// Convenience functions for backward compatibility
export async function trackWorkoutProgress(
  userId: string,
  workout: WorkoutData,
  deps: ProgressTrackingDependencies
): Promise<void> {
  const service = new ProgressTrackerService(deps);
  return service.trackWorkoutProgress(userId, workout);
}

export async function getProgressData(
  userId: string,
  timeRange: { start: Date; end: Date },
  deps: ProgressTrackingDependencies
): Promise<any[]> {
  const service = new ProgressTrackerService(deps);
  return service.getProgressData(userId, timeRange);
}

export async function getLatestProgress(
  userId: string,
  deps: ProgressTrackingDependencies
): Promise<any> {
  const service = new ProgressTrackerService(deps);
  return service.getLatestProgress(userId);
}
