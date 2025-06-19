import { initTRPC, TRPCError } from "@trpc/server";
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import superjson from "superjson";
import dotenv from "dotenv";
import { ZodError } from "zod";

// Load environment variables from root directory (3 levels up from packages/trpc/src/)
dotenv.config({ path: "../../.env" });

// Database setup with PostgreSQL
let db: any = null;
if (process.env.DATABASE_URL) {
  try {
    const client = postgres(process.env.DATABASE_URL);
    db = drizzle(client);
    console.log("Database connected successfully");
  } catch (error) {
    console.warn("Database connection failed:", error);
  }
} else {
  console.warn("DATABASE_URL not found in environment variables");
}

// Supabase setup (optional for now)
let supabase: any = null;
if (
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  try {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  } catch (error) {
    console.warn("Supabase connection failed:", error);
  }
}

// tRPC setup
const t = initTRPC
  .context<{
    db: typeof db;
    supabase: typeof supabase;
    userId?: string; // We'll add authentication later
  }>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

export const createContext = async () => {
  return {
    db,
    supabase,
    userId: "1cec9c4f-ca78-428d-af51-e8a5aa565358",
  };
};
