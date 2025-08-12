import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { waitlist, insertWaitlistSchema } from "@/drizzle/src/db/schema";
import { db } from "@/drizzle/src/db/queries";
import { env } from "@/env";

export const waitlistRouter = createTRPCRouter({
  join: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(1, "Full name is required"),
        email: z.string().email("Invalid email address"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const result = await db.insert(waitlist).values({
          fullName: input.fullName,
          email: input.email,
        }).returning();

        return {
          success: true,
          message: "Successfully joined the waitlist!",
          data: result[0],
        };
      } catch (error) {
        // Handle duplicate email error
        if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
          throw new Error("This email is already on our waitlist");
        }
        
        console.error("Waitlist join error:", error);
        throw new Error("Failed to join waitlist. Please try again.");
      }
    }),

  validateAccessCode: publicProcedure
    .input(
      z.object({
        accessCode: z.string().min(1, "Access code is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const isValid = input.accessCode === env.ACCESS_CODE;
      
      if (!isValid) {
        throw new Error("Invalid access code");
      }

      return {
        success: true,
        message: "Access code validated successfully",
      };
    }),
});