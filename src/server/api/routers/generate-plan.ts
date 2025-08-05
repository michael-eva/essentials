import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import {
  getUpcomingActivities,
  getPreviousPlans,
  getActivePlan,
  getWorkoutsToLog,
  getActivityHistory,
  getSupplementaryWorkouts,
  getActivityHistoryCount,
  checkOnboardingCompletion,
  getOnboardingData,
  getPersonalTrainerInteractions,
  getPersonalTrainerInteraction,
  getActivityHistoryWithProgress,
} from "@/drizzle/src/db/queries";
import {
  deleteWorkoutPlan,
  insertWorkoutTracking,
  updateCompletedClass,
  updateWorkoutPlan,
  updateWorkoutStatus,
  bookClass,
  deleteWorkout,
} from "@/drizzle/src/db/mutations";
import type { NewWorkoutTracking } from "@/drizzle/src/db/queries";
import { generateAndInsertWorkoutPlan } from "@/services/workout-plan-service";
import { triggerWorkoutCompletionNotification } from "@/services/workout-completion-notifications";

export const workoutPlanRouter = createTRPCRouter({
  getPreviousPlans: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getPreviousPlans(ctx.userId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching previous plans:", errorMessage);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch previous plans",
      });
    }
  }),

  getActivePlan: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getActivePlan(ctx.userId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching active plan:", errorMessage);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch active plan",
      });
    }
  }),

  getUpcomingActivities: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getUpcomingActivities(ctx.userId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching upcoming classes:", errorMessage);
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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching supplementary workouts:", errorMessage);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch supplementary workouts",
      });
    }
  }),

  getWorkoutsToLog: protectedProcedure.query(async ({ ctx }) => {
    try {
      const workouts = await getWorkoutsToLog(ctx.userId);
      return workouts;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching workouts to log:", errorMessage);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch workouts to log",
      });
    }
  }),

  getActivityHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const history = await getActivityHistory(
          ctx.userId,
          input.limit ?? 5,
          input.offset ?? 0,
        );
        return history;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Error fetching activity history:", errorMessage);
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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching activity history count:", errorMessage);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch activity history count",
      });
    }
  }),

  getActivityHistoryWithProgress: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const history = await getActivityHistoryWithProgress(
          ctx.userId,
          input.limit ?? 5,
          input.offset ?? 0,
        );
        return history;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          "Error fetching activity history with progress:",
          errorMessage,
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch activity history with progress",
        });
      }
    }),

  updateWorkoutStatus: protectedProcedure
    .input(
      z.object({
        workoutId: z.string(),
        status: z.enum(["completed", "not_completed", "not_recorded"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await updateWorkoutStatus(input.workoutId, input.status);
    }),
  insertManualActivity: protectedProcedure
    .input(
      z.object({
        workoutId: z.string().nullable().optional(),
        workoutType: z.enum(["run", "cycle", "swim", "walk", "class"]),
        date: z.date(),
        durationHours: z.number().optional(),
        durationMinutes: z.number().optional(),
        distance: z.string().optional(),
        distanceUnit: z.string().optional(),
        notes: z.string().optional(),
        intensity: z.number().optional(),
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
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newActivity = {
          userId: ctx.userId,
          workoutId: input.workoutId ?? uuidv4(),
          activityType: input.workoutType,
          date: input.date,
          durationHours: input.durationHours ?? undefined,
          durationMinutes: input.durationMinutes ?? undefined,
          distance: input.distance ?? undefined,
          distanceUnit: input.distanceUnit ?? undefined,
          notes: input.notes ?? undefined,
          intensity: input.intensity ?? undefined,
          name: input.workoutType,
          exercises: input.exercises ?? undefined,
        } as NewWorkoutTracking;
        if (input.workoutId) {
          await updateWorkoutStatus(input.workoutId, "completed");
        }
        const result = await insertWorkoutTracking(newActivity);

        // Trigger workout completion notification
        triggerWorkoutCompletionNotification(
          ctx.userId,
          newActivity.name ?? undefined,
        ).catch(console.error);

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Error inserting manual activity:", errorMessage);
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
        likelyToDoAgain: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newActivity = {
          userId: ctx.userId,
          workoutId: input.workoutId,
          activityType: "class",
          date: input.date,
          notes: input.notes ?? undefined,
          intensity: input.intensity ?? undefined,
          name: input.name,
          likelyToDoAgain: input.likelyToDoAgain ?? undefined,
        } as NewWorkoutTracking;
        await updateCompletedClass(input.workoutId, "completed");
        const result = await insertWorkoutTracking(newActivity);

        // Trigger workout completion notification
        triggerWorkoutCompletionNotification(
          ctx.userId,
          newActivity.name ?? undefined,
        ).catch(console.error);

        return result;
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
        const currentPlan = await getActivePlan(ctx.userId);
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
          (currentPlan.totalPausedDuration ?? 0) + pauseDuration;

        return await updateWorkoutPlan(input.planId, {
          totalPausedDuration: newTotalPausedDuration,
          resumedAt: now,
          pausedAt: null,
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
          totalPausedDuration: 0,
          startDate: null,
          pausedAt: null,
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
  generatePlan: protectedProcedure
    .input(z.object({ prompt: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      console.log("🚀 Starting generatePlan mutation");

      const result = await generateAndInsertWorkoutPlan({
        userId: ctx.userId,
        userPrompt: input.prompt,
        throwOnError: false,
      });

      if (!result.success) {
        // Check for specific error types
        if (result.errorCode === "BAD_REQUEST") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              result.error ||
              "AI returned invalid date format. Please try again.",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error || "Failed to generate workout plan",
        });
      }

      console.log("✅ Workout plan generated successfully:", {
        planId: result.planId,
      });
      return 200;
    }),

  bookClass: protectedProcedure
    .input(z.object({ workoutId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      //add functionality to book class with Hapana here

      // check if the workout is already booked
      // const workout = await getWorkoutById(input.workoutId);
      // if (workout?.isBooked) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: "Workout is already booked",
      //   });
      // }
      return await bookClass(
        input.workoutId,
        new Date(new Date().setDate(new Date().getDate() + 1)),
      );
    }),
  getOnboardingCompletion: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await checkOnboardingCompletion(ctx.userId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error checking onboarding completion:", errorMessage);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to check onboarding completion",
      });
    }
  }),

  getOnboardingData: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getOnboardingData(ctx.userId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching onboarding data:", errorMessage);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch onboarding data",
      });
    }
  }),

  getPersonalTrainerInteractions: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        return await getPersonalTrainerInteractions(
          ctx.userId,
          input.limit ?? 10,
          input.cursor,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          "Error fetching personal trainer interactions:",
          errorMessage,
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch personal trainer interactions",
        });
      }
    }),

  getPersonalTrainerInteraction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const interaction = await getPersonalTrainerInteraction(input.id);
        if (!interaction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Personal trainer interaction not found",
          });
        }
        return interaction;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          "Error fetching personal trainer interaction:",
          errorMessage,
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch personal trainer interaction",
        });
      }
    }),

  removeWorkoutFromSchedule: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        weekNumber: z.number(),
        workoutIndex: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the active plan to verify ownership and get weekly schedules
        const activePlan = await getActivePlan(ctx.userId);
        if (!activePlan || activePlan.id !== input.planId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Active plan not found or access denied",
          });
        }

        // Find the specific weekly schedule entry to remove
        const weeklySchedules = activePlan.weeklySchedules?.find(
          (week) => week.weekNumber === input.weekNumber,
        );

        if (!weeklySchedules?.items[input.workoutIndex]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workout not found in schedule",
          });
        }

        const workoutToRemove = weeklySchedules.items[input.workoutIndex];
        if (!workoutToRemove) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workout not found",
          });
        }

        // Delete the workout from the database (this will cascade to weekly_schedule)
        await deleteWorkout(workoutToRemove.id);

        return { success: true };
      } catch (error) {
        console.error("Error removing workout from schedule:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove workout from schedule",
        });
      }
    }),
});
