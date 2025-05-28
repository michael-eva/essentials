import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { workoutPlanRouter } from "./routers/workout-plan";
import { onboardingRouter } from "./routers/onboarding";
import { authRouter } from "./routers/auth";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  workoutPlan: workoutPlanRouter,
  onboarding: onboardingRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
