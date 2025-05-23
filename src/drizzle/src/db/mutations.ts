import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  workout,
  workoutTracking,
  workoutStatusEnum,
  workoutPlan,
  onboarding,
} from "./schema";
import type { NewOnboarding, NewWorkoutTracking } from "./queries";
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
