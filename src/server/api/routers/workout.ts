import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getWorkoutById } from "@/drizzle/src/db/queries";

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
});
