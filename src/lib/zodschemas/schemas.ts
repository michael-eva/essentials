import { z } from "zod";

export const NewWorkoutPlanSchema = z.object({
  userId: z.string().uuid(),
  planName: z.string(),
  weeks: z.number().int(),
  savedAt: z.string().datetime(),
  archived: z.boolean().default(false),
  archivedAt: z.string().datetime().nullable(),
  isActive: z.boolean().default(false),
  startDate: z.string().datetime().nullable(),
  pausedAt: z.string().datetime().nullable(),
  resumedAt: z.string().datetime().nullable(),
  totalPausedDuration: z.number().int().default(0),
});

export const NewWorkoutSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  instructor: z.string(),
  duration: z.number().int(),
  description: z.string(),
  level: z.string(),
  bookedDate: z.string().datetime().nullable(),
  type: z.enum(["class", "workout"]),
  status: z
    .enum(["completed", "not_completed", "not_recorded"])
    .default("not_recorded"),
  isBooked: z.boolean().default(false),
  classId: z.string().uuid().nullable(),
  userId: z.string().uuid(),
  activityType: z.enum(["run", "cycle", "swim", "walk"]).nullable(),
  exercises: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        sets: z.array(
          z.object({
            id: z.string(),
            reps: z.number(),
            weight: z.number(),
          }),
        ),
      }),
    )
    .nullable(),
});

export const NewWeeklyScheduleSchema = z.object({
  planId: z.string().uuid(),
  weekNumber: z.number().int(),
  workoutId: z.string().uuid(),
});

export const GeneratedWorkoutPlanResponseSchema = z.object({
  plan: NewWorkoutPlanSchema,
  workouts: z.array(NewWorkoutSchema),
  weeklySchedules: z.array(NewWeeklyScheduleSchema),
});

export const EditGeneratedWorkoutPlanResponseSchema = z.object({
  planId: z.string(),
  workoutsIds: z.array(z.string()),
  weeklySchedulesIds: z.array(z.string()),
  updatedWorkouts: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      instructor: z.string().nullable(),
      duration: z.number().int().nullable(),
      description: z.string().nullable(),
      level: z.string().nullable(),
    }),
  ),
  updatedWeeklySchedules: z.array(
    z.object({
      id: z.string(),
      weekNumber: z.number().int(),
      workoutId: z.string(),
    }),
  ),
  deletedWorkouts: z.array(z.string()),
  deletedWeeklySchedules: z.array(z.string()),
});

export const RecordActivityResponseSchema = z.object({});
