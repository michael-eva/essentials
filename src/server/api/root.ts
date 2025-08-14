import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { workoutRouter } from "./routers/workout";
import { workoutPlanRouter } from "./routers/generate-plan";
import { onboardingRouter } from "./routers/onboarding";
import { authRouter } from "./routers/auth";
import { personalTrainerRouter } from "./routers/personal-trainer";
import { myPtRouter } from "./routers/my-pt";
import { notificationsRouter } from "./routers/notifications";
import { adminRouter } from "./routers/admin";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  workoutPlan: workoutPlanRouter,
  workout: workoutRouter,
  onboarding: onboardingRouter,
  auth: authRouter,
  personalTrainer: personalTrainerRouter,
  myPt: myPtRouter,
  notifications: notificationsRouter,
  admin: adminRouter,
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
