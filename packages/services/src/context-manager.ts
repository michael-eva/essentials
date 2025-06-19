// Context Manager Service - Core business logic for user context management
import { z } from "zod";

// Define the core types
export type CompletedWorkout = {
  workout: {
    name: string | null;
    activityType: string | null;
    description: string | null;
    duration: string | null;
    level: string | null;
    isBooked: boolean;
    status: string | null;
  } | null;
  workoutTracking: {
    id: string;
    date: string;
    durationHours: number;
    durationMinutes: number;
    intensity: number;
    wouldDoAgain: boolean;
    activityType: string | null;
  };
};

export type UserContext = {
  profile: {
    // Basic info
    name: string | null;
    age: number | null;
    height: number | null;
    weight: number | null;
    gender: string | null;

    // Fitness info
    fitnessLevel: string | null;
    exercises: string[] | null;
    otherExercises: string[] | null;
    exerciseFrequency: string | null;
    sessionLength: string | null;

    // Goals
    fitnessGoals: string[] | null;
    goalTimeline: string | null;
    specificGoals: string | null;

    // Pilates experience
    pilatesExperience: boolean | null;
    pilatesDuration: string | null;
    studioFrequency: string | null;
    sessionPreference: string | null;
    apparatusPreference: string[] | null;
    customApparatus: string | null;

    // Motivation
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
    recentWorkouts: CompletedWorkout[];
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
    plannedWorkouts: {
      name: string;
      description: string | null;
      activityType: string | null;
      duration: string | null;
      level: string | null;
      isBooked: boolean;
      status: string | null;
    }[];
  };
};

// Define interfaces for dependencies
interface ContextServiceDependencies {
  getOnboardingData: (userId: string) => Promise<any>;
  getWorkoutTracking: (userId: string, timeRange: { start: Date; end: Date }) => Promise<any[]>;
  getActivePlan: (userId: string) => Promise<any>;
  getWorkoutById: (workoutId: string) => Promise<any>;
}

/**
 * Context Manager Service - handles all user context operations
 */
export class ContextManagerService {
  constructor(private deps: ContextServiceDependencies) {}

  /**
   * Builds a comprehensive context object for AI interactions
   */
  async buildUserContext(
    userId: string,
    timeRange: { start: Date; end: Date } = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date(),
    }
  ): Promise<UserContext> {
    // Fetch user data
    const [onboardingData, recentWorkoutTracking] = await Promise.all([
      this.deps.getOnboardingData(userId),
      this.deps.getWorkoutTracking(userId, timeRange),
    ]);

    // Calculate consistency metrics
    const consistency = this.calculateConsistency(recentWorkoutTracking, timeRange);

    // Calculate goal progress
    const goalProgress = this.calculateGoalProgress(
      recentWorkoutTracking,
      onboardingData
    );

    const activePlan = await this.deps.getActivePlan(userId);

    let workoutList: any[] = [];

    if (activePlan) {
      workoutList = activePlan.weeklySchedules.flatMap((week: any) => week.items);
    }

    const completedWorkouts: CompletedWorkout[] = [];

    for (const workoutTrack of recentWorkoutTracking) {
      const workoutData = await this.deps.getWorkoutById(workoutTrack.id);
      if (workoutData) {
        completedWorkouts.push({
          workout: workoutData,
          workoutTracking: workoutTrack,
        });
      }
    }

    return {
      profile: {
        name: onboardingData?.name ?? null,
        age: onboardingData?.age ?? null,
        height: onboardingData?.height ?? null,
        weight: onboardingData?.weight ?? null,
        gender: onboardingData?.gender ?? null,
        fitnessLevel: onboardingData?.fitnessLevel ?? null,
        exercises: onboardingData?.exercises ?? null,
        otherExercises: onboardingData?.otherExercises ?? null,
        exerciseFrequency: onboardingData?.exerciseFrequency ?? null,
        sessionLength: onboardingData?.sessionLength ?? null,
        fitnessGoals: onboardingData?.fitnessGoals ?? null,
        goalTimeline: onboardingData?.goalTimeline ?? null,
        specificGoals: onboardingData?.specificGoals ?? null,
        pilatesExperience: onboardingData?.pilatesExperience ?? null,
        pilatesDuration: onboardingData?.pilatesDuration ?? null,
        studioFrequency: onboardingData?.studioFrequency ?? null,
        sessionPreference: onboardingData?.sessionPreference ?? null,
        apparatusPreference: onboardingData?.apparatusPreference ?? null,
        customApparatus: onboardingData?.customApparatus ?? null,
        motivation: onboardingData?.motivation ?? null,
        otherMotivation: onboardingData?.otherMotivation ?? null,
        progressTracking: onboardingData?.progressTracking ?? null,
        otherProgressTracking: onboardingData?.otherProgressTracking ?? null,
        health: {
          injuries: onboardingData?.injuries ?? null,
          injuriesDetails: onboardingData?.injuriesDetails ?? null,
          recentSurgery: onboardingData?.recentSurgery ?? null,
          surgeryDetails: onboardingData?.surgeryDetails ?? null,
          chronicConditions: onboardingData?.chronicConditions ?? null,
          otherHealthConditions: onboardingData?.otherHealthConditions ?? null,
          pregnancy: onboardingData?.pregnancy ?? null,
        },
      },
      recentActivity: {
        recentWorkouts: completedWorkouts,
        consistency,
      },
      progress: {
        goalProgress,
        improvements: [], // To be implemented in progress tracking
        challenges: [], // To be implemented in progress tracking
      },
      workoutPlan: {
        plannedWorkouts: workoutList,
      },
    };
  }

  /**
   * Calculates workout consistency metrics
   */
  private calculateConsistency(
    workouts: any[],
    timeRange: { start: Date; end: Date }
  ): {
    weeklyAverage: number;
    monthlyAverage: number;
    streak: number;
  } {
    if (workouts.length === 0) {
      return {
        weeklyAverage: 0,
        monthlyAverage: 0,
        streak: 0,
      };
    }

    // Group workouts by week and month
    const workoutsByWeek = new Map<string, number>();
    const workoutsByMonth = new Map<string, number>();

    workouts.forEach((workout) => {
      const date = new Date(workout.date);
      const weekKey = `${date.getFullYear()}-W${this.getWeekNumber(date)}`;
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      workoutsByWeek.set(weekKey, (workoutsByWeek.get(weekKey) ?? 0) + 1);
      workoutsByMonth.set(monthKey, (workoutsByMonth.get(monthKey) ?? 0) + 1);
    });

    // Calculate averages
    const weeklyAverage =
      Array.from(workoutsByWeek.values()).reduce((sum, count) => sum + count, 0) /
      workoutsByWeek.size;
    const monthlyAverage =
      Array.from(workoutsByMonth.values()).reduce(
        (sum, count) => sum + count,
        0
      ) / workoutsByMonth.size;

    // Calculate current streak
    const streak = this.calculateStreak(workouts);

    return {
      weeklyAverage: Math.round(weeklyAverage * 10) / 10, // Round to 1 decimal place
      monthlyAverage: Math.round(monthlyAverage * 10) / 10,
      streak,
    };
  }

  /**
   * Helper function to get ISO week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() ?? 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Helper function to calculate current workout streak
   */
  private calculateStreak(workouts: any[]): number {
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
   * Calculates progress towards user's fitness goals
   */
  private calculateGoalProgress(
    workouts: any[],
    onboardingData: any
  ): Record<string, number> {
    if (!onboardingData?.fitnessGoals || workouts.length === 0) {
      return {};
    }

    const goalProgress: Record<string, number> = {};
    const goals = onboardingData.fitnessGoals;

    // Map common fitness goals to measurable metrics
    goals.forEach((goal: string) => {
      switch (goal.toLowerCase()) {
        case "improve strength":
          goalProgress[goal] = this.calculateStrengthProgress(workouts);
          break;
        case "increase flexibility":
          goalProgress[goal] = this.calculateFlexibilityProgress(workouts);
          break;
        case "build endurance":
          goalProgress[goal] = this.calculateEnduranceProgress(workouts);
          break;
        case "lose weight":
          goalProgress[goal] = this.calculateWeightLossProgress(workouts);
          break;
        case "maintain fitness":
          goalProgress[goal] = this.calculateMaintenanceProgress(workouts);
          break;
        default:
          // For custom goals, use a general progress calculation
          goalProgress[goal] = this.calculateGeneralProgress(workouts);
      }
    });

    return goalProgress;
  }

  /**
   * Helper functions for calculating progress towards specific goals
   */
  private calculateStrengthProgress(workouts: any[]): number {
    // TODO: Implement strength progress calculation
    // This would need to track weights used, reps, and exercise types
    return 0;
  }

  private calculateFlexibilityProgress(workouts: any[]): number {
    // TODO: Implement flexibility progress calculation
    // This would need to track stretching exercises and duration
    return 0;
  }

  private calculateEnduranceProgress(workouts: any[]): number {
    // TODO: Implement endurance progress calculation
    // This would need to track workout duration and intensity
    return 0;
  }

  private calculateWeightLossProgress(workouts: any[]): number {
    // TODO: Implement weight loss progress calculation
    // This would need to track weight measurements and workout intensity
    return 0;
  }

  private calculateMaintenanceProgress(workouts: any[]): number {
    // Calculate based on consistency and workout variety
    const consistency = this.calculateConsistency(workouts, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    });

    // Weight the factors: 60% consistency, 40% variety
    const consistencyScore = Math.min(consistency.weeklyAverage / 3, 1) * 60; // Target: 3 workouts per week
    const varietyScore = this.calculateWorkoutVariety(workouts) * 40;

    return Math.round(consistencyScore + varietyScore);
  }

  private calculateGeneralProgress(workouts: any[]): number {
    // Calculate based on overall workout consistency and frequency
    const consistency = this.calculateConsistency(workouts, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    });

    return Math.min(consistency.weeklyAverage / 3, 1) * 100; // Target: 3 workouts per week
  }

  private calculateWorkoutVariety(workouts: any[]): number {
    // Calculate the variety of workouts based on different types of exercises
    const uniqueExercises = new Set(workouts.map((w) => w.activityType));
    const totalExercises = workouts.length;

    if (totalExercises === 0) return 0;

    // Score based on the ratio of unique exercises to total workouts
    // Higher score for more variety
    return Math.min(uniqueExercises.size / totalExercises, 1);
  }

  /**
   * Gets relevant context for a specific interaction type
   */
  async getContextForInteraction(
    userId: string,
    interactionType:
      | "workout_feedback"
      | "progress_check"
      | "goal_setting"
      | "general"
  ): Promise<Partial<UserContext>> {
    const fullContext = await this.buildUserContext(userId);

    // Return only relevant parts of context based on interaction type
    switch (interactionType) {
      case "workout_feedback":
        return {
          profile: fullContext.profile,
          recentActivity: fullContext.recentActivity,
        };
      case "progress_check":
        return {
          profile: fullContext.profile,
          progress: fullContext.progress,
        };
      case "goal_setting":
        return {
          profile: fullContext.profile,
          progress: fullContext.progress,
        };
      default:
        return fullContext;
    }
  }
}

// Convenience functions for backward compatibility
export async function buildUserContext(
  userId: string,
  deps: ContextServiceDependencies,
  timeRange?: { start: Date; end: Date }
): Promise<UserContext> {
  const service = new ContextManagerService(deps);
  return service.buildUserContext(userId, timeRange);
}

export async function getContextForInteraction(
  userId: string,
  interactionType: "workout_feedback" | "progress_check" | "goal_setting" | "general",
  deps: ContextServiceDependencies
): Promise<Partial<UserContext>> {
  const service = new ContextManagerService(deps);
  return service.getContextForInteraction(userId, interactionType);
}
