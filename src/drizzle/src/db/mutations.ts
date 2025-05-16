import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { workout, workoutTracking, workoutStatusEnum } from "./schema";
import type { NewWorkoutTracking } from "./queries";
import { eq } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export async function insertWorkoutActivity(data: NewWorkoutTracking) {
  const activity = await db.insert(workoutTracking).values(data);
  return activity;
}

export async function updateCompletedClass(
  id: string,
  status: (typeof workoutStatusEnum.enumValues)[number],
) {
  const activity = await db
    .update(workout)
    .set({ status })
    .where(eq(workout.id, id));
  return activity;
}
