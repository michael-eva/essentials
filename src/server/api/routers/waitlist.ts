import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { waitlist } from "@/drizzle/src/db/schema";
import { env } from "@/env";

const client = postgres(env.DATABASE_URL);
const db = drizzle(client);

// Get the access code from environment variables

export const waitlistRouter = createTRPCRouter({
  // Submit waitlist form
  submitWaitlist: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(1, "Full name is required"),
        email: z.string().email("Please enter a valid email address"),
        accessCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const hasValidAccessCode = input.accessCode === env.WAITLIST_ACCESS_CODE;

        const result = await db.insert(waitlist).values({
          fullName: input.fullName,
          email: input.email,
          accessCode: input.accessCode || null,
          hasValidAccessCode,
        }).returning();

        return {
          success: true,
          hasValidAccessCode,
          message: hasValidAccessCode 
            ? "Valid access code! You can now sign in to the app." 
            : "Thank you for joining our waitlist!",
        };
      } catch (error) {
        console.error("Error submitting waitlist:", error);
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
      })
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