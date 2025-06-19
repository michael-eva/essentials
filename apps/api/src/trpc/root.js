import { createTRPCRouter } from "@essentials/trpc";
import { workoutPlanRouter } from "./routers/workout-plan.js";
import { onboardingRouter } from "./routers/onboarding.js";
import { authRouter } from "./routers/auth.js";
import { personalTrainerRouter } from "./routers/personal-trainer.js";
import { myPtRouter } from "./routers/my-pt.js";
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
//# sourceMappingURL=root.js.map