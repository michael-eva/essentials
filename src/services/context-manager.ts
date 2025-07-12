import type {
  WorkoutTracking,
  Onboarding,
  Workout,
} from "@/drizzle/src/db/queries";
import {
  getWorkoutTracking,
  getOnboardingData,
  getActivePlan,
  getWorkoutById,
} from "@/drizzle/src/db/queries";

export type completedWorkout = {
  workout: Workout | null;
  workoutTracking: WorkoutTracking;
};

export type UserContext = {
  profile: {
    basicInfo: {
      name: string | null;
      age: number | null;
      height: number | null;
      weight: number | null;
      gender: string | null;
    };

    // exercises: string[] | null;
    // otherExercises: string[] | null;
    // exerciseFrequency: string | null;
    // sessionLength: string | null;

    // fitnessGoals: string[] | null;
    // goalTimeline: string | null;
    // specificGoals: string | null;
    // otherFitnessGoals: string[] | null;

    pilates: {
      fitnessLevel: string | null;
      pilatesExperience: boolean | null;
      pilatesDuration: string | null;
      // studioFrequency: string | null;
      // sessionPreference: string | null;
      apparatusPreference: string[] | null;
      customApparatus: string[] | null;
    };
    motivationInfo: {
      motivation: string[] | null;
      otherMotivation: string[] | null;
      progressTracking: string[] | null;
      otherProgressTracking: string[] | null;
    };
    health: {
      injuries: boolean | null;
      injuriesDetails: string | null;
      recentSurgery: boolean | null;
      surgeryDetails: string | null;
      chronicConditions: string[] | null;
      otherHealthConditions: string[] | null;
      pregnancy: string | null;
      pregnancyConsultedDoctor: boolean | null;
      pregnancyConsultedDoctorDetails: string | null;
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
export async function buildUserContext(
  userId: string,
  _timeRange: { start: Date; end: Date } = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date(),
  },
): Promise<UserContext> {
  // Fetch user data
  const [onboardingData, recentWorkoutTracking] = await Promise.all([
    getOnboardingData(userId),
    getWorkoutTracking(userId, _timeRange),
  ]);

  // Calculate consistency metrics
  const consistency = calculateConsistency(recentWorkoutTracking, _timeRange);

  // Calculate goal progress
  const goalProgress = calculateGoalProgress(
    recentWorkoutTracking,
    onboardingData,
  );

  const activePlan = await getActivePlan(userId);

  let workoutList: Workout[] = [];

  if (activePlan) {
    workoutList = activePlan.weeklySchedules.flatMap((week) => week.items);
  }

  const completedWorkouts: completedWorkout[] = [];

  for (const workoutTrack of recentWorkoutTracking) {
    const workoutData = await getWorkoutById(workoutTrack.id);
    if (workoutData) {
      completedWorkouts.push({
        workout: workoutData,
        workoutTracking: workoutTrack,
      });
    }
  }

  return {
    profile: {
      basicInfo: {
        name: onboardingData?.name ?? null,
        age: onboardingData?.age ?? null,
        height: onboardingData?.height ?? null,
        weight: onboardingData?.weight ?? null,
        gender: onboardingData?.gender ?? null,
      },
      // exercises: onboardingData?.exercises ?? null,
      // otherExercises: onboardingData?.otherExercises ?? null,
      // exerciseFrequency: onboardingData?.exerciseFrequency ?? null,
      // sessionLength: onboardingData?.sessionLength ?? null,
      // fitnessGoals: onboardingData?.fitnessGoals ?? null,
      // otherFitnessGoals: onboardingData?.otherFitnessGoals ?? null,
      // goalTimeline: onboardingData?.goalTimeline ?? null,
      // specificGoals: onboardingData?.specificGoals ?? null,

      pilates: {
        fitnessLevel: onboardingData?.fitnessLevel ?? null,
        pilatesExperience: onboardingData?.pilatesExperience ?? null,
        pilatesDuration: onboardingData?.pilatesDuration ?? null,
        // studioFrequency: onboardingData?.studioFrequency ?? null,
        // sessionPreference: onboardingData?.sessionPreference ?? null,
        apparatusPreference: onboardingData?.apparatusPreference ?? null,
        customApparatus: onboardingData?.customApparatus ?? null,
      },

      motivationInfo: {
        motivation: onboardingData?.motivation ?? null,
        otherMotivation: onboardingData?.otherMotivation ?? null,
        progressTracking: onboardingData?.progressTracking ?? null,
        otherProgressTracking: onboardingData?.otherProgressTracking ?? null,
      },

      // Health
      health: {
        injuries: onboardingData?.injuries ?? null,
        injuriesDetails: onboardingData?.injuriesDetails ?? null,
        recentSurgery: onboardingData?.recentSurgery ?? null,
        surgeryDetails: onboardingData?.surgeryDetails ?? null,
        chronicConditions: onboardingData?.chronicConditions ?? null,
        otherHealthConditions: onboardingData?.otherHealthConditions ?? null,
        pregnancy: onboardingData?.pregnancy ?? null,
        pregnancyConsultedDoctor:
          onboardingData?.pregnancyConsultedDoctor ?? null,
        pregnancyConsultedDoctorDetails:
          onboardingData?.pregnancyConsultedDoctorDetails ?? null,
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
function calculateConsistency(
  workouts: WorkoutTracking[],
  timeRange: { start: Date; end: Date },
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
    const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;
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
      0,
    ) / workoutsByMonth.size;

  // Calculate current streak
  const streak = calculateStreak(workouts);

  return {
    weeklyAverage: Math.round(weeklyAverage * 10) / 10, // Round to 1 decimal place
    monthlyAverage: Math.round(monthlyAverage * 10) / 10,
    streak,
  };
}

/**
 * Helper function to get ISO week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() ?? 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Helper function to calculate current workout streak
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
 * Calculates progress towards user's fitness goals
 */
function calculateGoalProgress(
  workouts: WorkoutTracking[],
  onboardingData: Onboarding | null,
): Record<string, number> {
  if (!onboardingData?.fitnessGoals || workouts.length === 0) {
    return {};
  }

  const goalProgress: Record<string, number> = {};
  const goals = onboardingData.fitnessGoals;

  // Map common fitness goals to measurable metrics
  goals.forEach((goal) => {
    switch (goal.toLowerCase()) {
      case "improve strength":
        goalProgress[goal] = calculateStrengthProgress(workouts);
        break;
      case "increase flexibility":
        goalProgress[goal] = calculateFlexibilityProgress(workouts);
        break;
      case "build endurance":
        goalProgress[goal] = calculateEnduranceProgress(workouts);
        break;
      case "lose weight":
        goalProgress[goal] = calculateWeightLossProgress(workouts);
        break;
      case "maintain fitness":
        goalProgress[goal] = calculateMaintenanceProgress(workouts);
        break;
      default:
        // For custom goals, use a general progress calculation
        goalProgress[goal] = calculateGeneralProgress(workouts);
    }
  });

  return goalProgress;
}

/**
 * Helper functions for calculating progress towards specific goals
 */
function calculateStrengthProgress(workouts: WorkoutTracking[]): number {
  // TODO: Implement strength progress calculation
  // This would need to track weights used, reps, and exercise types
  return 0;
}

function calculateFlexibilityProgress(workouts: WorkoutTracking[]): number {
  // TODO: Implement flexibility progress calculation
  // This would need to track stretching exercises and duration
  return 0;
}

function calculateEnduranceProgress(workouts: WorkoutTracking[]): number {
  // TODO: Implement endurance progress calculation
  // This would need to track workout duration and intensity
  return 0;
}

function calculateWeightLossProgress(workouts: WorkoutTracking[]): number {
  // TODO: Implement weight loss progress calculation
  // This would need to track weight measurements and workout intensity
  return 0;
}

function calculateMaintenanceProgress(workouts: WorkoutTracking[]): number {
  // Calculate based on consistency and workout variety
  const consistency = calculateConsistency(workouts, {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  // Weight the factors: 60% consistency, 40% variety
  const consistencyScore = Math.min(consistency.weeklyAverage / 3, 1) * 60; // Target: 3 workouts per week
  const varietyScore = calculateWorkoutVariety(workouts) * 40;

  return Math.round(consistencyScore + varietyScore);
}

function calculateGeneralProgress(workouts: WorkoutTracking[]): number {
  // Calculate based on overall workout consistency and frequency
  const consistency = calculateConsistency(workouts, {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  return Math.min(consistency.weeklyAverage / 3, 1) * 100; // Target: 3 workouts per week
}

function calculateWorkoutVariety(workouts: WorkoutTracking[]): number {
  // Calculate the variety of workouts based on different types of exercises
  const uniqueExercises = new Set(workouts.map((w) => w.activityType));
  const totalExercises = workouts.length;

  if (totalExercises === 0) return 0;

  // Score based on the ratio of unique exercises to total workouts
  // Higher score for more variety
  return Math.min(uniqueExercises.size / totalExercises, 1);
}

/**
 * Updates context with new workout data
 */
export async function updateContextWithWorkout(
  userId: string,
  _newWorkout: WorkoutTracking,
): Promise<UserContext> {
  // TODO: Implement context update
  // 1. Fetch current context
  // 2. Add new workout data
  // 3. Recalculate metrics
  // 4. Return updated context

  return buildUserContext(userId);
}

/**
 * Gets relevant context for a specific interaction type
 */
export async function getContextForInteraction(
  userId: string,
  interactionType:
    | "workout_feedback"
    | "progress_check"
    | "goal_setting"
    | "general",
): Promise<Partial<UserContext>> {
  const fullContext = await buildUserContext(userId);

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
