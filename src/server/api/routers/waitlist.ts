import { createTRPCRouter, publicProcedure } from "../trpc";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { insertWaitlist, getWaitlistByEmail } from "@/drizzle/src/db/mutations";

const ACCESS_CODE = "ESSENTIALS2025"; // TODO: Move to environment variables

export const waitlistRouter = createTRPCRouter({
  // Join waitlist
  join: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(1, "Full name is required"),
        email: z.string().email("Invalid email format"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Check if email already exists on waitlist
        const existingEntry = await getWaitlistByEmail(input.email);
        if (existingEntry) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This email is already on the waitlist",
          });
        }

        // Add to waitlist
        const waitlistEntry = await insertWaitlist({
          fullName: input.fullName,
          email: input.email,
        });

        return {
          success: true,
          message: "Successfully joined the waitlist!",
          id: waitlistEntry.id,
        };
      } catch (error) {
        console.error("Error adding to waitlist:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to join waitlist",
        });
      }
    }),

  // Validate access code
  validateAccessCode: publicProcedure
    .input(
      z.object({
        accessCode: z.string().min(1, "Access code is required"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        if (input.accessCode !== ACCESS_CODE) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid access code",
          });
        }

        return {
          success: true,
          message: "Access code validated successfully",
        };
      } catch (error) {
        console.error("Error validating access code:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to validate access code",
        });
      }
    }),
});