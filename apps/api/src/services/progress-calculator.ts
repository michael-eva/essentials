import type { WorkoutTracking, Onboarding } from "../drizzle/src/db/queries";

export type ConsistencyMetrics = {
  weeklyAverage: number;
  monthlyAverage: number;
  streak: number;
};

export function calculateConsistency(
  workouts: WorkoutTracking[],
  timeRange: { start: Date; end: Date } = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date(),
  }
): ConsistencyMetrics {
  if (workouts.length === 0) {
    return {
      weeklyAverage: 0,
      monthlyAverage: 0,
      streak: 0,
    };
  }

  // Filter workouts within the time range
  const recentWorkouts = workouts.filter(
    (workout) =>
      workout.date >= timeRange.start && workout.date <= timeRange.end
  );

  // Calculate weekly average (workouts per week)
  const daysDiff = Math.ceil(
    (timeRange.end.getTime() - timeRange.start.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const weeksDiff = daysDiff / 7;
  const weeklyAverage = recentWorkouts.length / weeksDiff;

  // Calculate monthly average
  const monthlyAverage = recentWorkouts.length / (daysDiff / 30);

  // Calculate current streak
  const sortedWorkouts = recentWorkouts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    // Check up to 1 year back
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);

    const hasWorkoutOnDate = sortedWorkouts.some((workout) => {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === checkDate.getTime();
    });

    if (hasWorkoutOnDate) {
      streak++;
    } else {
      break;
    }
  }

  return {
    weeklyAverage,
    monthlyAverage,
    streak,
  };
}

export function calculateGoalProgress(
  workouts: WorkoutTracking[],
  onboardingData: Onboarding | null
): Record<string, number> {
  if (!onboardingData?.fitnessGoals || workouts.length === 0) {
    return {};
  }

  const goalProgress: Record<string, number> = {};
  const goals = onboardingData.fitnessGoals;

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
        goalProgress[goal] = calculateGeneralProgress(workouts);
    }
  });

  return goalProgress;
}

function calculateStrengthProgress(workouts: WorkoutTracking[]): number {
  // Calculate based on strength-focused workouts and intensity
  const strengthWorkouts = workouts.filter(
    (w) => w.activityType === "workout" || (w.intensity && w.intensity > 7)
  );

  const totalIntensity = strengthWorkouts.reduce(
    (sum, w) => sum + (w.intensity || 0),
    0
  );
  const avgIntensity =
    strengthWorkouts.length > 0 ? totalIntensity / strengthWorkouts.length : 0;

  // Return progress as percentage (0-100)
  return Math.min(100, (avgIntensity / 10) * 100);
}

function calculateFlexibilityProgress(workouts: WorkoutTracking[]): number {
  // Calculate based on flexibility-focused activities
  const flexibilityWorkouts = workouts.filter(
    (w) =>
      w.activityType === "pilates" || w.name?.toLowerCase().includes("stretch")
  );

  const totalDuration = flexibilityWorkouts.reduce(
    (sum, w) => sum + ((w.durationHours || 0) * 60 + (w.durationMinutes || 0)),
    0
  );

  // Return progress as percentage (0-100)
  return Math.min(100, (totalDuration / (30 * 60)) * 100); // 30 minutes per week target
}

function calculateEnduranceProgress(workouts: WorkoutTracking[]): number {
  // Calculate based on cardio activities
  const cardioWorkouts = workouts.filter((w) =>
    ["run", "cycle", "swim", "walk", "hike", "rowing", "elliptical"].includes(
      w.activityType || ""
    )
  );

  const totalDuration = cardioWorkouts.reduce(
    (sum, w) => sum + ((w.durationHours || 0) * 60 + (w.durationMinutes || 0)),
    0
  );

  // Return progress as percentage (0-100)
  return Math.min(100, (totalDuration / (150 * 60)) * 100); // 150 minutes per week target
}

function calculateWeightLossProgress(workouts: WorkoutTracking[]): number {
  // Calculate based on calorie-burning activities
  const totalDuration = workouts.reduce(
    (sum, w) => sum + ((w.durationHours || 0) * 60 + (w.durationMinutes || 0)),
    0
  );

  const totalIntensity = workouts.reduce(
    (sum, w) => sum + (w.intensity || 0),
    0
  );
  const avgIntensity =
    workouts.length > 0 ? totalIntensity / workouts.length : 0;

  // Return progress as percentage (0-100)
  return Math.min(100, (totalDuration / (300 * 60) + avgIntensity / 10) * 50);
}

function calculateMaintenanceProgress(workouts: WorkoutTracking[]): number {
  // Calculate based on consistency and variety
  const consistency = calculateConsistency(workouts);
  const variety = new Set(workouts.map((w) => w.activityType)).size;

  // Return progress as percentage (0-100)
  return Math.min(
    100,
    (consistency.weeklyAverage / 3) * 50 + (variety / 5) * 50
  );
}

function calculateGeneralProgress(workouts: WorkoutTracking[]): number {
  // General progress calculation
  const totalDuration = workouts.reduce(
    (sum, w) => sum + ((w.durationHours || 0) * 60 + (w.durationMinutes || 0)),
    0
  );

  const consistency = calculateConsistency(workouts);

  // Return progress as percentage (0-100)
  return Math.min(
    100,
    (totalDuration / (120 * 60) + consistency.weeklyAverage / 3) * 50
  );
}
