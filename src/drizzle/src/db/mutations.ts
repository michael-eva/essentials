import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { workoutTracking } from "./schema";
import type { NewWorkoutTracking } from "./queries";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export async function insertManualActivity(data: NewWorkoutTracking) {
  const activity = await db.insert(workoutTracking).values(data);
  return activity;
}
