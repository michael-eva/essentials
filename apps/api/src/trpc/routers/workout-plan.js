import { createTRPCRouter, protectedProcedure } from "@essentials/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { getUpcomingClasses, getPreviousPlans, getActivePlan, getWorkoutsToLog, getActivityHistory, getSupplementaryWorkouts, getActivityHistoryCount, checkOnboardingCompletion, getOnboardingData, getPersonalTrainerInteractions, getPersonalTrainerInteraction, } from "../../drizzle/src/db/queries";
import { deleteWorkoutPlan, insertWorkoutTracking, updateCompletedClass, updateWorkoutPlan, insertWorkoutPlan, insertWorkouts, insertWeeklySchedules, updateWorkoutStatus, bookClass, } from "../../drizzle/src/db/mutations";
import { generateAIResponse } from "../../services/personal-trainer";
import { buildUserContext } from "../../services/context-manager";
// Helper function to safely parse dates
function safeDateParse(dateString, fieldName) {
    if (!dateString)
        return null;
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format for ${fieldName}: ${dateString}`);
        }
        return date;
    }
    catch (error) {
        throw new Error(`Failed to parse date for ${fieldName}: ${dateString}. ${error}`);
    }
}
export const workoutPlanRouter = createTRPCRouter({
    getPreviousPlans: protectedProcedure.query(async ({ ctx }) => {
        try {
            return await getPreviousPlans(ctx.userId);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("Error fetching active plan:", errorMessage);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch active plan",
            });
        }
    }),
    getUpcomingClasses: protectedProcedure.query(async ({ ctx }) => {
        try {
            return await getUpcomingClasses(ctx.userId);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("Error fetching workouts to log:", errorMessage);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch workouts to log",
            });
        }
    }),
    getActivityHistory: protectedProcedure
        .input(z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
    }))
        .query(async ({ ctx, input }) => {
        try {
            const history = await getActivityHistory(ctx.userId, input.limit ?? 5, input.offset ?? 0);
            return history;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("Error fetching activity history count:", errorMessage);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch activity history count",
            });
        }
    }),
    updateWorkoutStatus: protectedProcedure
        .input(z.object({
        workoutId: z.string(),
        status: z.enum(["completed", "not_completed", "not_recorded"]),
    }))
        .mutation(async ({ ctx, input }) => {
        return await updateWorkoutStatus(input.workoutId, input.status);
    }),
    insertManualActivity: protectedProcedure
        .input(z.object({
        workoutType: z.string(),
        date: z.date(),
        durationHours: z.number().optional(),
        durationMinutes: z.number().optional(),
        distance: z.string().optional(),
        distanceUnit: z.string().optional(),
        notes: z.string().optional(),
        intensity: z.number().optional(),
        exercises: z
            .array(z.object({
            id: z.string(),
            name: z.string(),
            sets: z.array(z.object({
                id: z.string(),
                reps: z.number(),
                weight: z.number(),
            })),
        }))
            .optional(),
    }))
        .mutation(async ({ ctx, input }) => {
        try {
            const newActivity = {
                userId: ctx.userId,
                workoutId: uuidv4(),
                activityType: "workout",
                date: input.date,
                durationHours: input.durationHours ?? undefined,
                durationMinutes: input.durationMinutes ?? undefined,
                distance: input.distance ?? undefined,
                distanceUnit: input.distanceUnit ?? undefined,
                notes: input.notes ?? undefined,
                intensity: input.intensity ?? undefined,
                name: input.workoutType,
                exercises: input.exercises ?? undefined,
            };
            return await insertWorkoutTracking(newActivity);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("Error inserting manual activity:", errorMessage);
            throw error;
        }
    }),
    insertCompletedClass: protectedProcedure
        .input(z.object({
        workoutId: z.string(),
        activityType: z.string(),
        date: z.date(),
        notes: z.string().optional(),
        intensity: z.number().optional(),
        name: z.string(),
        wouldDoAgain: z.boolean().optional(),
    }))
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
                wouldDoAgain: input.wouldDoAgain ?? undefined,
            };
            await updateCompletedClass(input.workoutId, "completed");
            return await insertWorkoutTracking(newActivity);
        }
        catch (error) {
            console.error("Error inserting manual activity:", error);
            throw error;
        }
    }),
    startWorkoutPlan: protectedProcedure
        .input(z.object({
        planId: z.string(),
    }))
        .mutation(async ({ ctx, input }) => {
        try {
            return await updateWorkoutPlan(input.planId, {
                startDate: new Date(),
                pausedAt: null,
                resumedAt: null,
                totalPausedDuration: 0,
            });
        }
        catch (error) {
            console.error("Error starting workout plan:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to start workout plan",
            });
        }
    }),
    pauseWorkoutPlan: protectedProcedure
        .input(z.object({
        planId: z.string(),
    }))
        .mutation(async ({ ctx, input }) => {
        try {
            return await updateWorkoutPlan(input.planId, {
                pausedAt: new Date(),
            });
        }
        catch (error) {
            console.error("Error pausing workout plan:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to pause workout plan",
            });
        }
    }),
    resumeWorkoutPlan: protectedProcedure
        .input(z.object({
        planId: z.string(),
    }))
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
            const pauseDuration = Math.floor((now.getTime() - pausedAt.getTime()) / 1000);
            const newTotalPausedDuration = (currentPlan.totalPausedDuration ?? 0) + pauseDuration;
            return await updateWorkoutPlan(input.planId, {
                resumedAt: now,
                pausedAt: null,
                totalPausedDuration: newTotalPausedDuration,
            });
        }
        catch (error) {
            console.error("Error resuming workout plan:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to resume workout plan",
            });
        }
    }),
    cancelWorkoutPlan: protectedProcedure
        .input(z.object({
        planId: z.string(),
    }))
        .mutation(async ({ ctx, input }) => {
        try {
            const result = await updateWorkoutPlan(input.planId, {
                isActive: false,
            });
            return result;
        }
        catch (error) {
            console.error("Error canceling workout plan:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to cancel workout plan",
            });
        }
    }),
    restartWorkoutPlan: protectedProcedure
        .input(z.object({
        planId: z.string(),
    }))
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
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
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
        const userContext = await buildUserContext(ctx.userId);
        const generatedPlan = await generateAIResponse(ctx.userId, userContext);
        // Insert the plan with better date parsing error handling
        try {
            const planWithDates = {
                ...generatedPlan.plan,
                savedAt: safeDateParse(generatedPlan.plan.savedAt, "savedAt") ?? new Date(),
                archivedAt: safeDateParse(generatedPlan.plan.archivedAt, "archivedAt"),
                startDate: safeDateParse(generatedPlan.plan.startDate, "startDate"),
                pausedAt: safeDateParse(generatedPlan.plan.pausedAt, "pausedAt"),
                resumedAt: safeDateParse(generatedPlan.plan.resumedAt, "resumedAt"),
            };
            const plan = await insertWorkoutPlan(planWithDates);
            // Insert all workouts first with better date parsing
            const workoutsWithIds = generatedPlan.workouts.map((workout) => ({
                ...workout,
                id: uuidv4(),
                classId: workout.classId === null ? undefined : workout.classId,
                bookedDate: safeDateParse(workout.bookedDate, "bookedDate") ?? undefined,
                activityType: workout.activityType === null ? undefined : workout.activityType,
            }));
            const workouts = await insertWorkouts(workoutsWithIds);
            // Create a mapping from original workout IDs to inserted workout IDs
            const workoutIdMap = new Map();
            generatedPlan.workouts.forEach((originalWorkout, index) => {
                const insertedWorkout = workouts[index];
                if (insertedWorkout) {
                    workoutIdMap.set(originalWorkout.userId, insertedWorkout.id);
                }
            });
            // Insert weekly schedules with correct workout IDs
            const weeklySchedulesWithIds = generatedPlan.weeklySchedules.map((schedule, index) => {
                const workout = workouts[index % workouts.length];
                return {
                    ...schedule,
                    id: uuidv4(),
                    planId: plan.id,
                    workoutId: workout?.id ?? schedule.workoutId, // Use actual workout ID or fallback
                };
            });
            const weeklySchedules = await insertWeeklySchedules(weeklySchedulesWithIds);
            return {
                ...plan,
                workouts: workouts.map((workout, index) => ({
                    ...workout,
                    weekNumber: Math.floor(index / 3) + 1,
                })),
            };
        }
        catch (error) {
            console.error("Error in generatePlan:", error);
            console.error("Generated plan data:", JSON.stringify(generatedPlan, null, 2));
            // Check if it's a date parsing error
            if (error instanceof Error &&
                error.message.includes("Invalid time value")) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "AI returned invalid date format. Please try again.",
                });
            }
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to generate workout plan",
            });
        }
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
        return await bookClass(input.workoutId, new Date(new Date().setDate(new Date().getDate() + 1)));
    }),
    getOnboardingCompletion: protectedProcedure.query(async ({ ctx }) => {
        try {
            return await checkOnboardingCompletion(ctx.userId);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("Error fetching onboarding data:", errorMessage);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch onboarding data",
            });
        }
    }),
    getPersonalTrainerInteractions: protectedProcedure
        .input(z.object({
        limit: z.number().optional(),
        cursor: z.string().optional(),
    }))
        .query(async ({ ctx, input }) => {
        try {
            return await getPersonalTrainerInteractions(ctx.userId, input.limit ?? 10, input.cursor);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("Error fetching personal trainer interactions:", errorMessage);
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("Error fetching personal trainer interaction:", errorMessage);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch personal trainer interaction",
            });
        }
    }),
});
//# sourceMappingURL=workout-plan.js.map