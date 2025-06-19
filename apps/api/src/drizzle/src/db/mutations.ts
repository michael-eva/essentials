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
  workoutTypeEnum,
  AiChatMessages,
  AiSystemPrompt,
} from "./schema";
import type {
  NewWorkout,
  NewWorkoutPlan,
  NewWeeklySchedule,
  NewOnboarding,
  NewPersonalTrainerInteraction,
  NewProgressTracking,
  ProgressTracking,
  User,
  NewAiChatMessages,
  NewAiSystemPrompt,
} from "./queries";
import { eq } from "drizzle-orm";
import { trackWorkoutProgress } from "apps/api/src/services/progress-tracker";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export type WorkoutTrackingInput = {
  userId: string;
  workoutId?: string | null;
  activityType: string;
  date: Date;
  durationHours?: number | null;
  durationMinutes?: number | null;
  distance?: string | null;
  distanceUnit?: string | null;
  notes?: string | null;
  intensity?: number | null;
  name?: string | null;
  wouldDoAgain?: boolean | null;
  exercises?: Array<{
    id: string;
    name: string;
    sets: Array<{
      id: string;
      reps: number;
      weight: number;
    }>;
  }> | null;
};

export type NewWorkoutTracking = WorkoutTrackingInput;

export async function insertWorkoutTracking(data: WorkoutTrackingInput) {
  const result = await db
    .insert(workoutTracking)
    .values({
      userId: data.userId,
      workoutId: data.workoutId,
      activityType: data.activityType,
      date: data.date,
      durationHours: data.durationHours,
      durationMinutes: data.durationMinutes,
      distance: data.distance,
      distanceUnit: data.distanceUnit,
      notes: data.notes,
      intensity: data.intensity,
      name: data.name,
      wouldDoAgain: data.wouldDoAgain,
      exercises: data.exercises,
    })
    .returning();
  const newWorkout = result[0]!;

  // Automatically update progress tracking
  await trackWorkoutProgress(data.userId, newWorkout);

  return newWorkout;
}

export async function updateCompletedClass(
  id: string,
  status: (typeof workoutStatusEnum.enumValues)[number]
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
  }
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
  data: NewPersonalTrainerInteraction
) {
  const interaction = await db.insert(personalTrainerInteractions).values(data);
  return interaction;
}

export async function insertProgressTracking(
  data: NewProgressTracking
): Promise<ProgressTracking> {
  const result = await db.insert(progressTracking).values(data).returning();
  return result[0]!;
}

export async function insertWorkoutPlan(data: NewWorkoutPlan) {
  const result = await db.insert(workoutPlan).values(data).returning();
  return result[0]!;
}

export async function insertWorkouts(
  workouts: Array<{
    id: string;
    name: string;
    instructor: string;
    duration: number;
    description: string;
    level: string;
    type: (typeof workoutTypeEnum.enumValues)[number];
    status: (typeof workoutStatusEnum.enumValues)[number];
    isBooked: boolean;
    userId: string;
    classId?: number;
  }>
) {
  const result = await db.insert(workout).values(workouts).returning();
  return result;
}

export async function insertWeeklySchedules(
  schedules: Array<{
    id: string;
    planId: string;
    weekNumber: number;
    workoutId: string;
  }>
) {
  const result = await db.insert(weeklySchedule).values(schedules).returning();
  return result;
}
export async function updateWorkoutStatus(
  workoutId: string,
  status: (typeof workoutStatusEnum.enumValues)[number]
) {
  const result = await db
    .update(workout)
    .set({ status })
    .where(eq(workout.id, workoutId));
  return result;
}
export async function bookClass(workoutId: string, date: Date) {
  const result = await db
    .update(workout)
    .set({ isBooked: true, bookedDate: date })
    .where(eq(workout.id, workoutId));
  return result;
}

export async function insertAiChatMessages(data: NewAiChatMessages) {
  const result = await db.insert(AiChatMessages).values(data).returning();
  return result[0]!;
}

export async function insertAiSystemPrompt(data: NewAiSystemPrompt) {
  const result = await db.insert(AiSystemPrompt).values(data).returning();
  return result[0]!;
}

export async function updateAiSystemPrompt(
  id: string,
  data: NewAiSystemPrompt
) {
  const result = await db
    .update(AiSystemPrompt)
    .set(data)
    .where(eq(AiSystemPrompt.id, id))
    .returning();
  return result[0]!;
}
