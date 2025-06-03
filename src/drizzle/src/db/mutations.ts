import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  workout,
  workoutTracking,
  workoutStatusEnum,
  workoutPlan,
  weeklySchedule,
  onboarding,
  user,
  personalTrainerInteractions,
  progressTracking,
} from "./schema";
import type {
  NewWorkout,
  NewWorkoutTracking,
  NewWorkoutPlan,
  NewWeeklySchedule,
  NewOnboarding,
  NewPersonalTrainerInteraction,
  NewProgressTracking,
  ProgressTracking,
  User,
} from "./queries";
import { eq } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export async function insertWorkoutActivity(data: NewWorkoutTracking) {
  const activity = await db.insert(workoutTracking).values(data);
  return activity;
}

export async function updateCompletedClass(
  id: string,
  status: (typeof workoutStatusEnum.enumValues)[number],
) {
  const activity = await db
    .update(workout)
    .set({ status })
    .where(eq(workout.id, id));
  return activity;
}

export async function updateWorkoutPlan(
  planId: string,
  data: {
    startDate?: Date | null;
    pausedAt?: Date | null;
    resumedAt?: Date | null;
    totalPausedDuration?: number;
    isActive?: boolean;
    planName?: string;
  },
) {
  const updatedPlan = await db
    .update(workoutPlan)
    .set(data)
    .where(eq(workoutPlan.id, planId));
  return updatedPlan;
}
export async function deleteWorkoutPlan(planId: string) {
  const deletedPlan = await db
    .delete(workoutPlan)
    .where(eq(workoutPlan.id, planId));
  return deletedPlan;
}

export async function insertOnboarding(data: NewOnboarding) {
  try {
    const result = await db
      .insert(onboarding)
      .values(data)
      .onConflictDoUpdate({
        target: onboarding.userId,
        set: {
          ...data,
          updatedAt: new Date(),
        },
      });
    return result;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to insert/update onboarding data");
  }
}

export async function insertUser(data: User) {
  const result = await db.insert(user).values(data);
  return result;
}

export async function insertPersonalTrainerInteraction(
  data: NewPersonalTrainerInteraction,
) {
  const interaction = await db.insert(personalTrainerInteractions).values(data);
  return interaction;
}

export async function insertProgressTracking(
  data: NewProgressTracking,
): Promise<ProgressTracking> {
  const result = await db.insert(progressTracking).values(data).returning();
  return result[0]!;
}
