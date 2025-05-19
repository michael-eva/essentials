import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
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
} from "@/drizzle/src/db/queries";
import {
  insertWorkoutActivity,
  updateCompletedClass,
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
        ratings: z.array(z.string()).optional(),
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
          ratings: input.ratings,
          name: input.workoutType,
        };

        return await insertWorkoutActivity(newActivity);
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
        ratings: z.array(z.string()).optional(),
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
          ratings: input.ratings,
          name: input.name,
          wouldDoAgain: input.wouldDoAgain,
        };
        await updateCompletedClass(input.workoutId, "completed");
        return await insertWorkoutActivity(newActivity);
      } catch (error) {
        console.error("Error inserting manual activity:", error);
        throw error;
      }
    }),
});
