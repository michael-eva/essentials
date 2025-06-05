import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import {
  getUpcomingClasses,
  getPreviousPlans,
  getActivePlan,
  getWorkoutsToLog,
  getActivityHistory,
  getSupplementaryWorkouts,
  getActivityHistoryCount,
  checkOnboardingCompletion,
} from "@/drizzle/src/db/queries";
import {
  deleteWorkoutPlan,
  insertWorkoutTracking,
  updateCompletedClass,
  updateWorkoutPlan,
  insertWorkoutPlan,
  insertWorkouts,
  insertWeeklySchedules,
} from "@/drizzle/src/db/mutations";
import type { NewWorkoutTracking } from "@/drizzle/src/db/queries";

export const workoutPlanRouter = createTRPCRouter({
  getPreviousPlans: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getPreviousPlans(ctx.userId);
    } catch (error) {
      console.error("Error fetching previous plans:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch previous plans",
      });
    }
  }),

  getActivePlan: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getActivePlan();
    } catch (error) {
      console.error("Error fetching active plan:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch active plan",
      });
    }
  }),

  getUpcomingClasses: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getUpcomingClasses(ctx.userId);
    } catch (error) {
      console.error("Error fetching upcoming classes:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch upcoming classes",
      });
    }
  }),
  getSupplementaryWorkouts: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getSupplementaryWorkouts(ctx.userId);
    } catch (error) {
      console.error("Error fetching supplementary workouts:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch supplementary workouts",
      });
    }
  }),

  getWorkoutsToLog: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getWorkoutsToLog(ctx.userId);
    } catch (error) {
      console.error("Error fetching workouts to log:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch workouts to log",
      });
    }
  }),

  getActivityHistory: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().default(5),
          offset: z.number().default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      try {
        return await getActivityHistory(
          ctx.userId,
          input?.limit ?? 5,
          input?.offset ?? 0,
        );
      } catch (error) {
        console.error("Error fetching activity history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch activity history",
        });
      }
    }),

  getActivityHistoryCount: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getActivityHistoryCount(ctx.userId);
    } catch (error) {
      console.error("Error fetching activity history count:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch activity history count",
      });
    }
  }),

  insertManualActivity: protectedProcedure
    .input(
      z.object({
        workoutType: z.string(),
        date: z.date(),
        durationHours: z.number().optional(),
        durationMinutes: z.number().optional(),
        distance: z.string().optional(),
        distanceUnit: z.string().optional(),
        notes: z.string().optional(),
        intensity: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newActivity: NewWorkoutTracking = {
          userId: ctx.userId,
          workoutId: uuidv4(),
          activityType: "workout",
          date: input.date,
          durationHours: input.durationHours,
          durationMinutes: input.durationMinutes,
          distance: input.distance,
          distanceUnit: input.distanceUnit,
          notes: input.notes,
          intensity: input.intensity,
          name: input.workoutType,
        };

        return await insertWorkoutTracking(newActivity);
      } catch (error) {
        console.error("Error inserting manual activity:", error);
        throw error;
      }
    }),

  insertCompletedClass: protectedProcedure
    .input(
      z.object({
        workoutId: z.string(),
        activityType: z.string(),
        date: z.date(),
        notes: z.string().optional(),
        intensity: z.number().optional(),
        name: z.string(),
        wouldDoAgain: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newActivity: NewWorkoutTracking = {
          userId: ctx.userId,
          workoutId: input.workoutId,
          activityType: "class",
          date: input.date,
          notes: input.notes,
          intensity: input.intensity,
          name: input.name,
          wouldDoAgain: input.wouldDoAgain,
        };
        await updateCompletedClass(input.workoutId, "completed");
        return await insertWorkoutTracking(newActivity);
      } catch (error) {
        console.error("Error inserting manual activity:", error);
        throw error;
      }
    }),

  startWorkoutPlan: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await updateWorkoutPlan(input.planId, {
          startDate: new Date(),
          pausedAt: null,
          resumedAt: null,
          totalPausedDuration: 0,
        });
      } catch (error) {
        console.error("Error starting workout plan:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start workout plan",
        });
      }
    }),

  pauseWorkoutPlan: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await updateWorkoutPlan(input.planId, {
          pausedAt: new Date(),
        });
      } catch (error) {
        console.error("Error pausing workout plan:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to pause workout plan",
        });
      }
    }),

  resumeWorkoutPlan: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the current plan to calculate pause duration
        const currentPlan = await getActivePlan();
        if (!currentPlan) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No active plan found",
          });
        }

        const now = new Date();
        const pausedAt = currentPlan.pausedAt;

        if (!pausedAt) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Plan is not paused",
          });
        }

        // Calculate new pause duration
        const pauseDuration = Math.floor(
          (now.getTime() - pausedAt.getTime()) / 1000,
        );
        const newTotalPausedDuration =
          (currentPlan.totalPausedDuration || 0) + pauseDuration;

        return await updateWorkoutPlan(input.planId, {
          resumedAt: now,
          pausedAt: null,
          totalPausedDuration: newTotalPausedDuration,
        });
      } catch (error) {
        console.error("Error resuming workout plan:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resume workout plan",
        });
      }
    }),

  cancelWorkoutPlan: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await updateWorkoutPlan(input.planId, {
          isActive: false,
        });

        return result;
      } catch (error) {
        console.error("Error canceling workout plan:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel workout plan",
        });
      }
    }),

  restartWorkoutPlan: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const result = await updateWorkoutPlan(input.planId, {
          isActive: true,
          startDate: null,
          pausedAt: null,
          resumedAt: null,
          totalPausedDuration: 0,
        });

        return result;
      } catch (error) {
        console.error("Error restarting workout plan:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to restart workout plan",
        });
      }
    }),

  updatePlanName: protectedProcedure
    .input(z.object({ planId: z.string(), newName: z.string() }))
    .mutation(async ({ input }) => {
      try {
        return await updateWorkoutPlan(input.planId, {
          planName: input.newName,
        });
      } catch (error) {
        console.error("Error updating workout plan name:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update workout plan name",
        });
      }
    }),

  deleteWorkoutPlan: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        return await deleteWorkoutPlan(input.planId);
      } catch (error) {
        console.error("Error deleting workout plan:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete workout plan",
        });
      }
    }),
  generatePlan: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.userId;
    const isCompleted = await checkOnboardingCompletion(userId);

    if (!isCompleted) {
      throw new Error("Onboarding is not completed");
    }

    // Create the workout plan
    const planId = uuidv4();
    const plan = {
      id: planId,
      userId,
      planName: "Balanced Fitness Journey",
      weeks: 4,
      savedAt: new Date(),
      archived: false,
      archivedAt: null,
      isActive: false,
      startDate: new Date(),
      pausedAt: null,
      resumedAt: null,
      totalPausedDuration: 0,
    };

    // Insert the plan
    await insertWorkoutPlan(plan);

    // Create workouts for each week
    const workouts = [
      // Week 1
      {
        id: uuidv4(),
        name: "Morning Run",
        instructor: "Self-guided",
        duration: 30,
        description:
          "Steady-state run at a comfortable pace. Focus on maintaining consistent breathing and form.",
        level: "beginner",
        type: "workout" as const,
        status: "not_recorded" as const,
        isBooked: false,
        userId,
      },
      {
        id: uuidv4(),
        name: "Essentials Reformer",
        instructor: "TBD",
        duration: 50,
        description:
          "Our signature open level flow style Reformer class. Using a variety of props, this 50 minute workout is designed to challenge the whole body, while focusing on alignment and strengthening from within.",
        level: "All levels",
        type: "class" as const,
        status: "not_recorded" as const,
        isBooked: false,
        classId: 3,
        userId,
      },
      {
        id: uuidv4(),
        name: "Swimming Session",
        instructor: "Self-guided",
        duration: 45,
        description:
          "Swimming workout focusing on freestyle and backstroke. Include warm-up laps and technique drills.",
        level: "beginner",
        type: "workout" as const,
        status: "not_recorded" as const,
        isBooked: false,
        userId,
      },
      // Week 2
      {
        id: uuidv4(),
        name: "Power Reformer",
        instructor: "TBD",
        duration: 50,
        description:
          "Elevate your Pilates practice with our Power Reformer class. We take the fundamentals of reformer and kick it up a notch to bring you an extra strong and spicy flow.",
        level: "Intermediate",
        type: "class" as const,
        status: "not_recorded" as const,
        isBooked: false,
        classId: 6,
        userId,
      },
      {
        id: uuidv4(),
        name: "Hiking Adventure",
        instructor: "Self-guided",
        duration: 90,
        description:
          "Moderate intensity hike on a scenic trail. Focus on maintaining steady pace and proper form on inclines.",
        level: "intermediate",
        type: "workout" as const,
        status: "not_recorded" as const,
        isBooked: false,
        userId,
      },
      {
        id: uuidv4(),
        name: "Rowing Session",
        instructor: "Self-guided",
        duration: 40,
        description:
          "Rowing machine workout with intervals of high and low intensity. Focus on proper form and full range of motion.",
        level: "beginner",
        type: "workout" as const,
        status: "not_recorded" as const,
        isBooked: false,
        userId,
      },
      // Week 3
      {
        id: uuidv4(),
        name: "Jump Reformer",
        instructor: "TBD",
        duration: 50,
        description:
          "Get ready to jump into action with our Jump Reformer class! This open level dynamic workout will challenge your entire body while working up a sweat.",
        level: "All levels",
        type: "class" as const,
        status: "not_recorded" as const,
        isBooked: false,
        classId: 4,
        userId,
      },
      {
        id: uuidv4(),
        name: "Elliptical Training",
        instructor: "Self-guided",
        duration: 45,
        description:
          "Elliptical machine workout with varying resistance levels. Include intervals of high intensity and recovery periods.",
        level: "beginner",
        type: "workout" as const,
        status: "not_recorded" as const,
        isBooked: false,
        userId,
      },
      {
        id: uuidv4(),
        name: "Power Walking",
        instructor: "Self-guided",
        duration: 60,
        description:
          "Brisk walking workout focusing on maintaining a fast pace and proper posture. Great for active recovery.",
        level: "beginner",
        type: "workout" as const,
        status: "not_recorded" as const,
        isBooked: false,
        userId,
      },
      // Week 4
      {
        id: uuidv4(),
        name: "Barre",
        instructor: "TBD",
        duration: 45,
        description:
          "A fitness style barre class combining bodyweight and equipment based pilates exercises in a seamless flow for a total body workout.",
        level: "All levels",
        type: "class" as const,
        status: "not_recorded" as const,
        isBooked: false,
        classId: 5,
        userId,
      },
      {
        id: uuidv4(),
        name: "HIIT Running",
        instructor: "Self-guided",
        duration: 35,
        description:
          "High-intensity interval training on the track or treadmill. Alternate between sprinting and walking recovery periods.",
        level: "intermediate",
        type: "workout" as const,
        status: "not_recorded" as const,
        isBooked: false,
        userId,
      },
      {
        id: uuidv4(),
        name: "Swimming Intervals",
        instructor: "Self-guided",
        duration: 50,
        description:
          "Interval-based swimming workout focusing on speed and endurance. Include different stroke variations.",
        level: "intermediate",
        type: "workout" as const,
        status: "not_recorded" as const,
        isBooked: false,
        userId,
      },
    ];

    // Insert all workouts
    await insertWorkouts(workouts);

    // Create weekly schedules
    const weeklySchedules = workouts.map((workout, index) => ({
      id: uuidv4(),
      planId,
      weekNumber: Math.floor(index / 3) + 1,
      workoutId: workout.id,
    }));

    // Insert weekly schedules
    await insertWeeklySchedules(weeklySchedules);

    return {
      ...plan,
      workouts: workouts.map((workout, index) => ({
        ...workout,
        weekNumber: Math.floor(index / 3) + 1,
      })),
    };
  }),
});
