import {
  eq,
  and,
  gt,
  lt,
  inArray,
  desc,
  sql,
  gte,
  lte,
  asc,
  isNull,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  workout,
  workoutTracking,
  workoutPlan,
  weeklySchedule,
  onboarding,
  user,
  personalTrainerInteractions,
  progressTracking,
  AiChatMessages,
  AiSystemPrompt,
} from "./schema";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Type definitions
export type Workout = InferSelectModel<typeof workout>;
export type WorkoutTracking = InferSelectModel<typeof workoutTracking>;
export type WorkoutPlan = InferSelectModel<typeof workoutPlan>;
export type WeeklySchedule = InferSelectModel<typeof weeklySchedule>;
export type ProgressTracking = InferSelectModel<typeof progressTracking>;
export type AiChatMessages = InferSelectModel<typeof AiChatMessages>;
export type AiSystemPrompt = InferSelectModel<typeof AiSystemPrompt>;

export type NewWorkout = InferInsertModel<typeof workout>;
export type NewWorkoutTracking = InferInsertModel<typeof workoutTracking>;
export type NewWorkoutPlan = InferInsertModel<typeof workoutPlan>;
export type NewWeeklySchedule = InferInsertModel<typeof weeklySchedule>;
export type NewOnboarding = InferInsertModel<typeof onboarding>;
export type NewAiChatMessages = InferInsertModel<typeof AiChatMessages>;
export type NewAiSystemPrompt = InferInsertModel<typeof AiSystemPrompt>;
export type Onboarding = InferSelectModel<typeof onboarding>;
export type User = InferSelectModel<typeof user>;
export type PersonalTrainerInteraction = InferSelectModel<
  typeof personalTrainerInteractions
>;
export type NewPersonalTrainerInteraction = InferInsertModel<
  typeof personalTrainerInteractions
>;
export type NewProgressTracking = InferInsertModel<typeof progressTracking>;

// Initialize database connection
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export async function getUpcomingActivities(
  userId: string,
): Promise<
  | (Workout & { tracking: WorkoutTracking | null; weekNumber?: number })[]
  | { status: "no_plan" | "plan_paused" | "plan_inactive"; planName?: string }
> {
  // First check if there's an active workout plan for the user
  const activePlan = await db
    .select()
    .from(workoutPlan)
    .where(
      and(
        eq(workoutPlan.userId, userId),
        eq(workoutPlan.isActive, true),
        isNull(workoutPlan.pausedAt),
      ),
    )
    .limit(1);

  // If no active plan exists, check if there are any plans for the user
  if (!activePlan[0]) {
    const userPlans = await db
      .select()
      .from(workoutPlan)
      .where(eq(workoutPlan.userId, userId))
      .orderBy(desc(workoutPlan.savedAt))
      .limit(1);

    if (userPlans.length === 0) {
      return { status: "no_plan" };
    }

    const latestPlan = userPlans[0]!;

    if (!latestPlan.isActive) {
      return { status: "plan_inactive", planName: latestPlan.planName };
    }

    // Plan is active but paused
    return { status: "plan_paused", planName: latestPlan.planName };
  }

  const workouts = await db
    .select({
      id: workout.id,
      name: workout.name,
      instructor: workout.instructor,
      description: workout.description,
      level: workout.level,
      bookedDate: workout.bookedDate,
      type: workout.type,
      status: workout.status,
      isBooked: workout.isBooked,
      classId: workout.classId,
      userId: workout.userId,
      activityType: workout.activityType,
      duration: workout.duration,
      weekNumber: weeklySchedule.weekNumber,
    })
    .from(workout)
    .leftJoin(weeklySchedule, eq(workout.id, weeklySchedule.workoutId))
    .where(and(eq(workout.userId, userId), eq(workout.status, "not_recorded")))
    .orderBy(asc(weeklySchedule.weekNumber))
    .limit(3);

  const workoutIds = workouts.map((w) => w.id);
  const trackingData = await db
    .select()
    .from(workoutTracking)
    .where(inArray(workoutTracking.workoutId, workoutIds));

  const workoutIdsFiltered = trackingData
    .map((t) => t.workoutId)
    .filter((id): id is string => Boolean(id));

  return workouts.map((workout) => ({
    ...workout,
    tracking: trackingData.find((t) => t.workoutId === workout.id) ?? null,
    weekNumber: workout.weekNumber ?? undefined,
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

  const workoutIdsFiltered = trackingData
    .map((t) => t.workoutId)
    .filter((id): id is string => Boolean(id));

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

export async function getActivePlan(userId: string): Promise<
  | (WorkoutPlan & {
      weeklySchedules: { weekNumber: number; items: Workout[] }[];
    })
  | null
> {
  const plan = await db
    .select()
    .from(workoutPlan)
    .where(and(eq(workoutPlan.isActive, true), eq(workoutPlan.userId, userId)))
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

export async function getWorkoutsToLog(userId: string): Promise<{
  workouts: (Workout & { weekNumber?: number })[];
  currentWeek?: number;
}> {
  // First get the active plan for the user
  const activePlan = await db
    .select()
    .from(workoutPlan)
    .where(
      and(
        eq(workoutPlan.userId, userId),
        eq(workoutPlan.isActive, true),
        isNull(workoutPlan.pausedAt),
      ),
    )
    .limit(1);

  // If no active plan exists, return workouts without week filtering
  if (!activePlan[0]) {
    const workouts = await db
      .select()
      .from(workout)
      .where(
        and(eq(workout.status, "not_recorded"), eq(workout.userId, userId)),
      )
      .limit(3);

    return {
      workouts: workouts.map((w) => ({ ...w, weekNumber: undefined })),
      currentWeek: undefined,
    };
  }

  const plan = activePlan[0]!;

  // If plan hasn't started yet, return empty array
  if (!plan.startDate) {
    return {
      workouts: [],
      currentWeek: undefined,
    };
  }

  const now = new Date();
  const startDate = new Date(plan.startDate);

  // If plan hasn't started yet, return empty array
  if (now < startDate) {
    return {
      workouts: [],
      currentWeek: undefined,
    };
  }

  // Calculate total paused time in milliseconds
  let totalPausedMs = plan.totalPausedDuration * 1000; // Convert seconds to milliseconds

  // If currently paused, add time since pause
  if (plan.pausedAt && !plan.resumedAt) {
    const pausedAt = new Date(plan.pausedAt);
    totalPausedMs += now.getTime() - pausedAt.getTime();
  }

  // Calculate effective elapsed time (actual time minus paused time)
  const effectiveElapsedMs =
    now.getTime() - startDate.getTime() - totalPausedMs;

  // Convert to weeks (7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
  const weekInMs = 7 * 24 * 60 * 60 * 1000;
  const currentWeek = Math.floor(effectiveElapsedMs / weekInMs) + 1;

  // If effective elapsed time is negative, return workouts from week 1 only
  if (effectiveElapsedMs < 0) {
    const week1Workouts = await db
      .select({
        workout: workout,
        weekNumber: weeklySchedule.weekNumber,
      })
      .from(workout)
      .innerJoin(weeklySchedule, eq(workout.id, weeklySchedule.workoutId))
      .where(
        and(
          eq(workout.status, "not_recorded"),
          eq(workout.userId, userId),
          eq(weeklySchedule.planId, plan.id),
          eq(weeklySchedule.weekNumber, 1),
        ),
      )
      .limit(3);

    return {
      workouts: week1Workouts.map((w) => ({
        ...w.workout,
        weekNumber: w.weekNumber,
      })),
      currentWeek: 1,
    };
  }

  // Ensure current week is within valid range (1 to total weeks)
  const maxWeek = Math.min(currentWeek, plan.weeks);

  // Get workouts from current week and prior weeks
  const workouts = await db
    .select({
      workout: workout,
      weekNumber: weeklySchedule.weekNumber,
    })
    .from(workout)
    .innerJoin(weeklySchedule, eq(workout.id, weeklySchedule.workoutId))
    .where(
      and(
        eq(workout.status, "not_recorded"),
        eq(workout.userId, userId),
        eq(weeklySchedule.planId, plan.id),
        lte(weeklySchedule.weekNumber, maxWeek),
      ),
    )
    .orderBy(asc(weeklySchedule.weekNumber))
    .limit(3);

  return {
    workouts: workouts.map((w) => ({ ...w.workout, weekNumber: w.weekNumber })),
    currentWeek: maxWeek,
  };
}

export async function getActivityHistory(
  userId: string,
  limit = 5,
  offset = 0,
): Promise<Array<{ tracking: WorkoutTracking; workout: Workout | null }>> {
  const trackingData = await db
    .select()
    .from(workoutTracking)
    .where(eq(workoutTracking.userId, userId))
    .orderBy(desc(workoutTracking.date))
    .limit(limit)
    .offset(offset);

  // Fetch related workouts in bulk
  const workoutIds = trackingData
    .map((t) => t.workoutId)
    .filter((id): id is string => Boolean(id));
  let workouts: Workout[] = [];
  if (workoutIds.length > 0) {
    workouts = await db
      .select()
      .from(workout)
      .where(inArray(workout.id, workoutIds));
  }

  return trackingData.map((tracking) => ({
    tracking,
    workout: workouts.find((w) => w.id === tracking.workoutId) ?? null,
  }));
}

export async function getActivityHistoryCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
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

export async function getUser(userId: string): Promise<User | null> {
  const userData = await db.select().from(user).where(eq(user.id, userId));

  return userData[0] ?? null;
}

export async function getPersonalTrainerInteractions(
  userId: string,
  limit = 10,
  cursor?: string,
): Promise<{ items: PersonalTrainerInteraction[]; nextCursor?: string }> {
  const items = await db
    .select()
    .from(personalTrainerInteractions)
    .where(eq(personalTrainerInteractions.userId, userId))
    .orderBy(desc(personalTrainerInteractions.createdAt))
    .limit(limit + 1)
    .offset(cursor ? parseInt(cursor) : 0);

  let nextCursor: string | undefined = undefined;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = (parseInt(cursor ?? "0") + limit).toString();
  }

  return {
    items,
    nextCursor,
  };
}

export async function getPersonalTrainerInteraction(
  id: string,
): Promise<PersonalTrainerInteraction | null> {
  const interaction = await db
    .select()
    .from(personalTrainerInteractions)
    .where(eq(personalTrainerInteractions.id, id))
    .limit(1);

  return interaction[0] ?? null;
}

export async function getWorkoutTracking(
  userId: string,
  timeRange: { start: Date; end: Date },
): Promise<WorkoutTracking[]> {
  return db
    .select()
    .from(workoutTracking)
    .where(
      and(
        eq(workoutTracking.userId, userId),
        gt(workoutTracking.date, timeRange.start),
        lt(workoutTracking.date, timeRange.end),
      ),
    )
    .orderBy(desc(workoutTracking.date));
}

export async function getProgressTracking(
  userId: string,
  timeRange: { start: Date; end: Date },
): Promise<ProgressTracking[]> {
  return db
    .select()
    .from(progressTracking)
    .where(
      and(
        eq(progressTracking.userId, userId),
        gte(progressTracking.date, timeRange.start),
        lte(progressTracking.date, timeRange.end),
      ),
    )
    .orderBy(desc(progressTracking.date));
}

export async function getLatestProgressTracking(
  userId: string,
): Promise<ProgressTracking | null> {
  const result = await db
    .select()
    .from(progressTracking)
    .where(eq(progressTracking.userId, userId))
    .orderBy(desc(progressTracking.date))
    .limit(1);

  return result[0] ?? null;
}
export async function getWorkoutById(
  workoutId: string,
): Promise<Workout | null> {
  const result = await db
    .select()
    .from(workout)
    .where(eq(workout.id, workoutId));
  return result[0] ?? null;
}

export async function getMessages(userId: string): Promise<AiChatMessages[]> {
  const result = await db
    .select()
    .from(AiChatMessages)
    .where(eq(AiChatMessages.userId, userId))
    .orderBy(desc(AiChatMessages.createdAt));
  return result;
}

export async function getAiSystemPrompt(
  userId: string,
): Promise<AiSystemPrompt | null> {
  const result = await db
    .select()
    .from(AiSystemPrompt)
    .where(eq(AiSystemPrompt.userId, userId))
    .orderBy(desc(AiSystemPrompt.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getActivityHistoryWithProgress(
  userId: string,
  limit = 5,
  offset = 0,
): Promise<
  Array<{
    tracking: WorkoutTracking;
    workout: Workout | null;
    progress: ProgressTracking | null;
  }>
> {
  const trackingData = await db
    .select()
    .from(workoutTracking)
    .where(eq(workoutTracking.userId, userId))
    .orderBy(desc(workoutTracking.date))
    .limit(limit)
    .offset(offset);

  // Fetch related workouts in bulk
  const workoutIds = trackingData
    .map((t) => t.workoutId)
    .filter((id): id is string => Boolean(id));
  let workouts: Workout[] = [];
  if (workoutIds.length > 0) {
    workouts = await db
      .select()
      .from(workout)
      .where(inArray(workout.id, workoutIds));
  }

  // For each tracking, get the progressTracking entry for the workoutTrackingId
  const progressEntries: ProgressTracking[] = await db
    .select()
    .from(progressTracking)
    .where(eq(progressTracking.userId, userId));

  return trackingData.map((tracking) => {
    const progress =
      progressEntries.find((p) => p.workoutTrackingId === tracking.id) ?? null;
    return {
      tracking,
      workout: workouts.find((w) => w.id === tracking.workoutId) ?? null,
      progress,
    };
  });
}
