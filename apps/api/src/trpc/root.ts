import { createTRPCRouter } from "@essentials/trpc";
import { workoutPlanRouter } from "./routers/workout-plan";
import { onboardingRouter } from "./routers/onboarding";
import { authRouter } from "./routers/auth";
import { personalTrainerRouter } from "./routers/personal-trainer";
import { myPtRouter } from "./routers/my-pt";

/**
 * This is the primary router for your server.
 *
 * All routers added in /trpc/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  workoutPlan: workoutPlanRouter,
  onboarding: onboardingRouter,
  auth: authRouter,
  personalTrainer: personalTrainerRouter,
  myPt: myPtRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
