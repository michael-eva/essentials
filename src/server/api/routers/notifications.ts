import { createTRPCRouter, publicProcedure } from "../trpc";
import { getPushSubscriptionByUserId } from "@/drizzle/src/db/queries";

export const notificationsRouter = createTRPCRouter({
  getNotificationSubscriptionStatus: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return {
        hasSubscription: false,
      };
    }
    const subscription = await getPushSubscriptionByUserId(ctx.userId);
    return {
      hasSubscription: !!subscription,
    };
  }),
});
