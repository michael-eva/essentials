import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Create a single database connection instance
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);
