import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { workout, workoutTracking, workoutPlan, weeklySchedule, onboarding, user, personalTrainerInteractions, progressTracking, AiChatMessages, AiSystemPrompt, } from "./schema";
import { eq } from "drizzle-orm";
import { trackWorkoutProgress } from "../../../services/progress-tracker";
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);
export async function insertWorkoutTracking(data) {
    const result = await db
        .insert(workoutTracking)
        .values({
        userId: data.userId,
        workoutId: data.workoutId,
        activityType: data.activityType,
        date: data.date,
        durationHours: data.durationHours,
        durationMinutes: data.durationMinutes,
        distance: data.distance,
        distanceUnit: data.distanceUnit,
        notes: data.notes,
        intensity: data.intensity,
        name: data.name,
        wouldDoAgain: data.wouldDoAgain,
        exercises: data.exercises,
    })
        .returning();
    const newWorkout = result[0];
    // Automatically update progress tracking
    await trackWorkoutProgress(data.userId, newWorkout);
    return newWorkout;
}
export async function updateCompletedClass(id, status) {
    const activity = await db
        .update(workout)
        .set({ status })
        .where(eq(workout.id, id));
    return activity;
}
export async function updateWorkoutPlan(planId, data) {
    const updatedPlan = await db
        .update(workoutPlan)
        .set(data)
        .where(eq(workoutPlan.id, planId));
    return updatedPlan;
}
export async function deleteWorkoutPlan(planId) {
    const deletedPlan = await db
        .delete(workoutPlan)
        .where(eq(workoutPlan.id, planId));
    return deletedPlan;
}
export async function insertOnboarding(data) {
    try {
        const result = await db
            .insert(onboarding)
            .values(data)
            .onConflictDoUpdate({
            target: onboarding.userId,
            set: {
                ...data,
                updatedAt: new Date(),
            },
        });
        return result;
    }
    catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to insert/update onboarding data");
    }
}
export async function insertUser(data) {
    const result = await db.insert(user).values(data);
    return result;
}
export async function insertPersonalTrainerInteraction(data) {
    const interaction = await db.insert(personalTrainerInteractions).values(data);
    return interaction;
}
export async function insertProgressTracking(data) {
    const result = await db.insert(progressTracking).values(data).returning();
    return result[0];
}
export async function insertWorkoutPlan(data) {
    const result = await db.insert(workoutPlan).values(data).returning();
    return result[0];
}
export async function insertWorkouts(workouts) {
    const result = await db.insert(workout).values(workouts).returning();
    return result;
}
export async function insertWeeklySchedules(schedules) {
    const result = await db.insert(weeklySchedule).values(schedules).returning();
    return result;
}
export async function updateWorkoutStatus(workoutId, status) {
    const result = await db
        .update(workout)
        .set({ status })
        .where(eq(workout.id, workoutId));
    return result;
}
export async function bookClass(workoutId, date) {
    const result = await db
        .update(workout)
        .set({ isBooked: true, bookedDate: date })
        .where(eq(workout.id, workoutId));
    return result;
}
export async function insertAiChatMessages(data) {
    const result = await db.insert(AiChatMessages).values(data).returning();
    return result[0];
}
export async function insertAiSystemPrompt(data) {
    const result = await db.insert(AiSystemPrompt).values(data).returning();
    return result[0];
}
export async function updateAiSystemPrompt(id, data) {
    const result = await db
        .update(AiSystemPrompt)
        .set(data)
        .where(eq(AiSystemPrompt.id, id))
        .returning();
    return result[0];
}
//# sourceMappingURL=mutations.js.map