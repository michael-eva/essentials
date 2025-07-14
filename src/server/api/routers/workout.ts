import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getPilatesClassViaWorkout,
  getWorkoutById,
  getPilatesClasses,
  getPilatesVideoById,
} from "@/drizzle/src/db/queries";
import { deleteWorkout, insertWorkouts } from "@/drizzle/src/db/mutations";

export const workoutRouter = createTRPCRouter({
  getWorkout: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const workout = await getWorkoutById(input.id);

        if (!workout) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workout not found",
          });
        }

        // Ensure the workout belongs to the current user
        if (workout.userId !== ctx.userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to access this workout",
          });
        }

        return workout;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Error fetching workout:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch workout",
        });
      }
    }),
  deleteWorkout: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workout = await deleteWorkout(input.id);
      return workout;
    }),
  insertWorkouts: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          instructor: z.string(),
          duration: z.number(),
          description: z.string(),
          level: z.string(),
          type: z.enum(["workout", "class"]),
          status: z.enum(["completed", "not_completed", "not_recorded"]),
          isBooked: z.boolean(),
          userId: z.string(),
          classId: z.string().optional(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const workout = await insertWorkouts(input);
      return workout;
    }),
  getPilatesClassViaWorkout: protectedProcedure
    .input(z.object({ workoutId: z.string() }))
    .query(async ({ ctx, input }) => {
      const pilatesClass = await getPilatesClassViaWorkout(input.workoutId);
      return pilatesClass;
    }),
  // endpoint to fetch all pilates videos
  getPilatesVideos: protectedProcedure
    .query(async () => {
      return await getPilatesClasses();
    }),
  // endpoint to fetch a single pilates video by id
  getPilatesVideoById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      try {
        const video = await getPilatesVideoById(input.id);
        if (!video) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Pilates video not found" });
        }
        return video;
      } catch (error) {
        console.error('Error in getPilatesVideoById endpoint:', error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch pilates video" });
      }
    }),
});
