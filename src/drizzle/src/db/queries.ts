import { eq, and, gt, lt, inArray, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  workout,
  workoutTracking,
  workoutPlan,
  weeklySchedule,
  onboarding,
  user,
} from "./schema";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Type definitions
export type Workout = InferSelectModel<typeof workout>;
export type WorkoutTracking = InferSelectModel<typeof workoutTracking>;
export type WorkoutPlan = InferSelectModel<typeof workoutPlan>;
export type WeeklySchedule = InferSelectModel<typeof weeklySchedule>;

export type NewWorkout = InferInsertModel<typeof workout>;
export type NewWorkoutTracking = InferInsertModel<typeof workoutTracking>;
export type NewWorkoutPlan = InferInsertModel<typeof workoutPlan>;
export type NewWeeklySchedule = InferInsertModel<typeof weeklySchedule>;
export type NewOnboarding = InferInsertModel<typeof onboarding>;
export type Onboarding = InferSelectModel<typeof onboarding>;
export type User = InferSelectModel<typeof user>;

// Initialize database connection
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export async function getUpcomingClasses(
  userId: string,
): Promise<(Workout & { tracking: WorkoutTracking | null })[]> {
  const now = new Date();

  const workouts = await db
    .select()
    .from(workout)
    .where(
      and(
        eq(workout.type, "class"),
        eq(workout.isBooked, true),
        eq(workout.userId, userId),
        gt(workout.bookedDate, now),
      ),
    );

  const workoutIds = workouts.map((w) => w.id);
  const trackingData = await db
    .select()
    .from(workoutTracking)
    .where(inArray(workoutTracking.workoutId, workoutIds));

  return workouts.map((workout) => ({
    ...workout,
    tracking: trackingData.find((t) => t.workoutId === workout.id) ?? null,
  }));
}
export async function getSupplementaryWorkouts(
  userId: string,
): Promise<(Workout & { tracking: WorkoutTracking | null })[]> {
  const now = new Date();

  const workouts = await db
    .select()
    .from(workout)
    .where(
      and(
        eq(workout.type, "workout"),
        eq(workout.isBooked, true),
        eq(workout.userId, userId),
        gt(workout.bookedDate, now),
      ),
    );

  const workoutIds = workouts.map((w) => w.id);
  const trackingData = await db
    .select()
    .from(workoutTracking)
    .where(inArray(workoutTracking.workoutId, workoutIds));

  return workouts.map((workout) => ({
    ...workout,
    tracking: trackingData.find((t) => t.workoutId === workout.id) ?? null,
  }));
}

export async function getPreviousPlans(userId: string): Promise<
  (WorkoutPlan & {
    weeklySchedules: { weekNumber: number; items: Workout[] }[];
  })[]
> {
  const plans = await db
    .select()
    .from(workoutPlan)
    .where(and(eq(workoutPlan.isActive, false), eq(workoutPlan.userId, userId)))
    .orderBy(desc(workoutPlan.savedAt));

  const plansWithSchedules = await Promise.all(
    plans.map(async (plan) => {
      const planWeeklySchedules = await db
        .select()
        .from(weeklySchedule)
        .where(eq(weeklySchedule.planId, plan.id));

      const workoutIds = planWeeklySchedules.map((ws) => ws.workoutId);
      const planWorkouts = await db
        .select()
        .from(workout)
        .where(inArray(workout.id, workoutIds));

      const weeks = Array.from({ length: plan.weeks }, (_, i) => {
        const weekNumber = i + 1;
        const weekSchedules = planWeeklySchedules.filter(
          (ws) => ws.weekNumber === weekNumber,
        );
        const weekWorkouts = weekSchedules
          .map((ws) => planWorkouts.find((w) => w.id === ws.workoutId))
          .filter((w): w is Workout => w !== undefined);
        return {
          weekNumber,
          items: weekWorkouts,
        };
      });

      return {
        ...plan,
        weeklySchedules: weeks,
      };
    }),
  );

  return plansWithSchedules;
}

export async function getActivePlan(): Promise<
  | (WorkoutPlan & {
      weeklySchedules: { weekNumber: number; items: Workout[] }[];
    })
  | null
> {
  const plan = await db
    .select()
    .from(workoutPlan)
    .where(eq(workoutPlan.isActive, true))
    .limit(1);

  if (!plan[0]) return null;

  const planWeeklySchedules = await db
    .select()
    .from(weeklySchedule)
    .where(eq(weeklySchedule.planId, plan[0].id));

  const workoutIds = planWeeklySchedules.map((ws) => ws.workoutId);
  const planWorkouts = await db
    .select()
    .from(workout)
    .where(inArray(workout.id, workoutIds));

  const weeks = Array.from({ length: plan[0].weeks }, (_, i) => {
    const weekNumber = i + 1;
    const weekSchedules = planWeeklySchedules.filter(
      (ws) => ws.weekNumber === weekNumber,
    );
    const weekWorkouts = weekSchedules
      .map((ws) => planWorkouts.find((w) => w.id === ws.workoutId))
      .filter((w): w is Workout => w !== undefined);
    return {
      weekNumber,
      items: weekWorkouts,
    };
  });

  return {
    ...plan[0],
    weeklySchedules: weeks,
  };
}

export async function getWorkoutsToLog(userId: string): Promise<Workout[]> {
  const now = new Date();
  return db
    .select()
    .from(workout)
    .where(
      and(
        eq(workout.isBooked, true),
        eq(workout.status, "not_recorded"),
        eq(workout.userId, userId),
        lt(workout.bookedDate, now),
      ),
    );
}

export async function getActivityHistory(
  userId: string,
  limit = 5,
  offset = 0,
): Promise<WorkoutTracking[]> {
  const trackingData = await db
    .select()
    .from(workoutTracking)
    .where(eq(workoutTracking.userId, userId))
    .orderBy(desc(workoutTracking.date))
    .limit(limit)
    .offset(offset);
  return trackingData;
}

export async function getActivityHistoryCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(workoutTracking)
    .where(eq(workoutTracking.userId, userId));
  return result[0]?.count ?? 0;
}

export async function checkOnboardingCompletion(
  userId: string,
): Promise<boolean> {
  const onboardingData = await db
    .select()
    .from(onboarding)
    .where(eq(onboarding.userId, userId));

  if (onboardingData.length === 0) return false;

  const data = onboardingData[0]!;

  return (
    data.name !== null &&
    data.age !== null &&
    data.weight !== null &&
    data.gender !== null &&
    data.fitnessLevel !== null &&
    data.exercises !== null &&
    data.exerciseFrequency !== null &&
    data.sessionLength !== null &&
    data.injuries !== null &&
    data.recentSurgery !== null &&
    data.chronicConditions !== null &&
    data.pregnancy !== null &&
    data.fitnessGoals !== null &&
    data.goalTimeline !== null &&
    data.pilatesExperience !== null &&
    data.studioFrequency !== null &&
    data.sessionPreference !== null &&
    data.instructors !== null &&
    data.apparatusPreference !== null &&
    data.motivation !== null &&
    data.progressTracking !== null
  );
}

export async function getOnboardingData(
  userId: string,
): Promise<Onboarding | null> {
  const onboardingData = await db
    .select()
    .from(onboarding)
    .where(eq(onboarding.userId, userId));

  return onboardingData[0] ?? null;
}
