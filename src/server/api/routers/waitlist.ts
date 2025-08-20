import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import { insertWaitlist } from "@/drizzle/src/db/mutations";

// Get the access code from environment variables

export const waitlistRouter = createTRPCRouter({
  // Submit waitlist form
  submitWaitlist: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(1, "Full name is required"),
        email: z.string().email("Please enter a valid email address"),
        accessCode: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const hasValidAccessCode =
          input.accessCode === env.WAITLIST_ACCESS_CODE;

        const result = await insertWaitlist({
          fullName: input.fullName,
          email: input.email,
          accessCode: input.accessCode || null,
          hasValidAccessCode,
        });

        // const result = await db.insert(waitlist).values({
        //   fullName: input.fullName,
        //   email: input.email,
        //   accessCode: input.accessCode || null,
        //   hasValidAccessCode,
        // }).returning();

        return {
          success: true,
          hasValidAccessCode,
          message: hasValidAccessCode
            ? "Valid access code! You can now sign in to the app."
            : "Thank you for joining our waitlist!",
        };
      } catch (error) {
        console.error("Error submitting waitlist:", error);
        
        // Check if this is a unique constraint violation for email
        if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
          const pgError = error as { constraint_name?: string };
          if (pgError.constraint_name === 'waitlist_email_unique') {
            throw new TRPCError({
              code: "CONFLICT",
              message: "This email address is already registered on our waitlist.",
            });
          }
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit waitlist form. Please try again.",
        });
      }
    }),

  // Validate access code without submitting to waitlist
  validateAccessCode: publicProcedure
    .input(
      z.object({
        accessCode: z.string().min(1, "Access code is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const isValid = input.accessCode === env.WAITLIST_ACCESS_CODE;

      return {
        isValid,
        message: isValid
          ? "Valid access code! You can now access the app."
          : "Invalid access code. Please check and try again.",
      };
    }),
});
