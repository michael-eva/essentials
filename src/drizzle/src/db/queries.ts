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
  PilatesVideos,
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
export type PilatesVideos = InferSelectModel<typeof PilatesVideos>;

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
    .innerJoin(weeklySchedule, eq(workout.id, weeklySchedule.workoutId))
    .where(
      and(
        eq(workout.userId, userId),
        eq(workout.status, "not_recorded"),
        eq(weeklySchedule.planId, activePlan[0].id),
      ),
    )
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

  return workouts.map((workout) => {
    const tracking =
      trackingData.find((t) => t.workoutId === workout.id) ?? null;
    return {
      ...workout,
      tracking,
      weekNumber: workout.weekNumber ?? undefined,
      exercises: tracking?.exercises ?? null,
    };
  });
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
    weeklySchedules: {
      weekNumber: number;
      items: (Workout & { mux_playback_id?: string })[];
    }[];
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

      // 1. Get all classIds for class-type workouts
      const classIds = planWorkouts
        .filter((w) => w.type === "class" && w.classId)
        .map((w) => w.classId)
        .filter((id): id is string => id !== null);

      // 2. Fetch pilates videos for those classIds
      let pilatesVideos: { id: string; mux_playback_id: string }[] = [];
      if (classIds.length > 0) {
        pilatesVideos = (
          await db
            .select({
              id: PilatesVideos.id,
              mux_playback_id: PilatesVideos.mux_playback_id,
            })
            .from(PilatesVideos)
            .where(inArray(PilatesVideos.id, classIds))
        ).filter((v) => v.mux_playback_id !== null) as {
          id: string;
          mux_playback_id: string;
        }[];
      }

      // 3. Create a map for quick lookup
      const pilatesVideoMap = Object.fromEntries(
        pilatesVideos.map((v) => [v.id, v.mux_playback_id]),
      );

      // 4. When building weekWorkouts, attach mux_playback_id if class
      const weeks = Array.from({ length: plan.weeks }, (_, i) => {
        const weekNumber = i + 1;
        const weekSchedules = planWeeklySchedules.filter(
          (ws) => ws.weekNumber === weekNumber,
        );
        const weekWorkouts = weekSchedules
          .map((ws) => {
            const w = planWorkouts.find((w) => w.id === ws.workoutId);
            if (w && w.type === "class" && w.classId) {
              return {
                ...w,
                mux_playback_id: pilatesVideoMap[w.classId] || null,
              };
            }
            return w;
          })
          .filter(
            (w): w is Workout & { mux_playback_id?: string } => w !== undefined,
          );
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

  // 1. Get all classIds for class-type workouts
  const classIds = planWorkouts
    .filter((w) => w.type === "class" && w.classId)
    .map((w) => w.classId)
    .filter((id): id is string => id !== null);

  // 2. Fetch pilates videos for those classIds
  let pilatesVideos: { id: string; mux_playback_id: string }[] = [];
  if (classIds.length > 0) {
    pilatesVideos = (
      await db
        .select({
          id: PilatesVideos.id,
          mux_playback_id: PilatesVideos.mux_playback_id,
        })
        .from(PilatesVideos)
        .where(inArray(PilatesVideos.id, classIds))
    ).filter((v) => v.mux_playback_id !== null) as {
      id: string;
      mux_playback_id: string;
    }[];
  }

  // 3. Create a map for quick lookup
  const pilatesVideoMap = Object.fromEntries(
    pilatesVideos.map((v) => [v.id, v.mux_playback_id]),
  );

  // 4. When building weekWorkouts, attach mux_playback_id if class
  const weeks = Array.from({ length: plan[0].weeks }, (_, i) => {
    const weekNumber = i + 1;
    const weekSchedules = planWeeklySchedules.filter(
      (ws) => ws.weekNumber === weekNumber,
    );
    const weekWorkouts = weekSchedules
      .map((ws) => {
        const w = planWorkouts.find((w) => w.id === ws.workoutId);
        if (w && w.type === "class" && w.classId) {
          return {
            ...w,
            mux_playback_id: pilatesVideoMap[w.classId] || null,
          };
        }
        return w;
      })
      .filter(
        (w): w is Workout & { mux_playback_id?: string } => w !== undefined,
      );
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

  const plan = activePlan[0];

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
): Promise<boolean | { missingFields: Record<string, string[]> }> {
  const onboardingData = await db
    .select()
    .from(onboarding)
    .where(eq(onboarding.userId, userId));

  if (onboardingData.length === 0) {
    return {
      missingFields: {
        basic: ["name", "age", "weight", "gender", "height"],
        fitness: ["exercises", "exerciseFrequency", "sessionLength"],
        health: [
          "injuries",
          "recentSurgery",
          "chronicConditions",
          "pregnancy",
          "injuriesDetails",
          "otherHealthConditions",
          "pregnancyConsultedDoctor",
          "pregnancyConsultedDoctorDetails",
          "surgeryDetails",
        ],
        goals: ["fitnessGoals", "goalTimeline"],
        pilates: [
          "fitnessLevel",
          "pilatesExperience",
          "apparatusPreference",
          "pilatesDuration",
          "customApparatus",
        ],
        motivation: ["motivation", "progressTracking"],
        // timing: [
        //   "preferredWorkoutTimes",
        //   "avoidedWorkoutTimes",
        //   "weekendWorkoutTimes",
        // ],
      },
    };
  }

  const data = onboardingData[0]!;
  const missingFields = {
    basic: [] as string[],
    fitness: [] as string[],
    health: [] as string[],
    goals: [] as string[],
    pilates: [] as string[],
    motivation: [] as string[],
    timing: [] as string[],
  };

  // Basic info
  if (data.name === null) missingFields.basic.push("name");
  if (data.age === null) missingFields.basic.push("age");
  if (data.weight === null) missingFields.basic.push("weight");
  if (data.height === null) missingFields.basic.push("height");
  if (data.gender === null) missingFields.basic.push("gender");

  // Fitness background
  // if (data.fitnessLevel === null) missingFields.fitness.push("fitnessLevel");
  if (data.exercises === null || data.exercises.length === 0)
    missingFields.fitness.push("exercises");
  if (data.exerciseFrequency === null)
    missingFields.fitness.push("exerciseFrequency");
  if (data.sessionLength === null) missingFields.fitness.push("sessionLength");

  // Health considerations
  if (data.injuries === null) missingFields.health.push("injuries");
  if (data.recentSurgery === null) missingFields.health.push("recentSurgery");
  if (data.chronicConditions === null || data.chronicConditions.length === 0)
    missingFields.health.push("chronicConditions");
  if (data.pregnancy === null && data.gender !== "Male")
    missingFields.health.push("pregnancy");

  // Goals
  if (data.fitnessGoals === null || data.fitnessGoals.length === 0)
    missingFields.goals.push("fitnessGoals");
  if (data.goalTimeline === null) missingFields.goals.push("goalTimeline");

  // Pilates
  if (data.fitnessLevel === null) missingFields.pilates.push("fitnessLevel");
  if (data.pilatesExperience === null)
    missingFields.pilates.push("pilatesExperience");
  if (data.pilatesExperience === true && data.pilatesDuration === null)
    missingFields.pilates.push("pilatesDuration");
  if (
    data.apparatusPreference === null ||
    data.apparatusPreference.length === 0
  )
    missingFields.pilates.push("apparatusPreference");
  if (data.customApparatus === null || data.customApparatus.length === 0)
    missingFields.pilates.push("customApparatus");

  // if (data.studioFrequency === null)
  //   missingFields.pilates.push("studioFrequency");
  // if (data.sessionPreference === null)
  //   missingFields.pilates.push("sessionPreference");

  // Motivation
  if (data.motivation === null) missingFields.motivation.push("motivation");
  if (data.progressTracking === null)
    missingFields.motivation.push("progressTracking");
  // if (data.preferredWorkoutTimes === null)
  //   missingFields.timing.push("preferredWorkoutTimes");
  // if (data.avoidedWorkoutTimes === null)
  //   missingFields.timing.push("avoidedWorkoutTimes");
  // if (data.weekendWorkoutTimes === null)
  //   missingFields.timing.push("weekendWorkoutTimes");

  // Remove empty categories
  const filteredMissingFields = Object.fromEntries(
    Object.entries(missingFields).filter(([_, fields]) => fields.length > 0),
  );

  return Object.keys(filteredMissingFields).length === 0
    ? true
    : { missingFields: filteredMissingFields };
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
    .orderBy(asc(AiChatMessages.createdAt), asc(AiChatMessages.id));
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

export async function getPilatesClasses(): Promise<Array<PilatesVideos>> {
  const pilatesClasses = await db.select().from(PilatesVideos);
  return pilatesClasses;
}
export async function getPilatesClassViaWorkout(
  workoutId: string,
): Promise<PilatesVideos | null> {
  const workoutResult = await db
    .select()
    .from(workout)
    .where(eq(workout.id, workoutId));
  if (!workoutResult[0]?.classId) return null;
  console.log(workoutResult[0].classId);
  const pilatesClass = await db
    .select()
    .from(PilatesVideos)
    .where(eq(PilatesVideos.id, workoutResult[0].classId));
  return pilatesClass[0] ?? null;
}

export async function getWorkoutsByWeek(planId: string, weekNumber: number) {
  const result = await db
    .select({
      schedule: weeklySchedule,
      workout: workout,
    })
    .from(weeklySchedule)
    .innerJoin(workout, eq(weeklySchedule.workoutId, workout.id))
    .where(
      eq(weeklySchedule.planId, planId) &&
        eq(weeklySchedule.weekNumber, weekNumber),
    );
  return result;
}

export async function getWeeklySchedulesByPlan(planId: string) {
  const result = await db
    .select()
    .from(weeklySchedule)
    .where(eq(weeklySchedule.planId, planId));
  return result;
}
