import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getUpcomingClasses,
  getPreviousPlans,
  getActivePlan,
  getWorkoutsToLog,
  getActivityHistory,
  getSupplementaryWorkouts,
} from "@/drizzle/src/db/queries";

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

  getActivityHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getActivityHistory(ctx.userId);
    } catch (error) {
      console.error("Error fetching activity history:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch activity history",
      });
    }
  }),
});
