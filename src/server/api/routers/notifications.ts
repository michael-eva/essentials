import { createTRPCRouter, publicProcedure } from "../trpc";
import { getPushSubscriptionByUserId, getNotificationPreferences } from "@/drizzle/src/db/queries";
import { upsertNotificationPreferences } from "@/drizzle/src/db/mutations";
import { z } from "zod";

const notificationPreferencesSchema = z.object({
  enabledTypes: z.array(z.string()),
});

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

  getPreferences: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new Error("Not authenticated");
    }
    const preferences = await getNotificationPreferences(ctx.userId);
    return preferences;
  }),

  updatePreferences: publicProcedure
    .input(notificationPreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new Error("Not authenticated");
      }
      
      const updatedPreferences = await upsertNotificationPreferences({
        userId: ctx.userId,
        enabledTypes: input.enabledTypes,
      });
      
      return updatedPreferences;
    }),
});
