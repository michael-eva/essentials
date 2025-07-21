import { logout, verifyOtp } from "@/services/auth-helpers";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import z from "zod";
import { TRPCError } from "@trpc/server";
import SendEmail from "@/services/resend";
import {
  insertUser,
  updateUser,
  clearAllUserData,
} from "@/drizzle/src/db/mutations";
import { getUser } from "@/drizzle/src/db/queries";

export const authRouter = createTRPCRouter({
  generateOtp: publicProcedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase.auth.admin.generateLink({
          email: input.email,
          type: "signup",
          password: input.password,
        });

        if (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        const email = data.user.email ?? "";
        const token = data.properties.email_otp ?? "";

        const response = await SendEmail({
          to: email,
          subject: "Your verification code",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #333; margin: 0;">Verification Code</h2>
              </div>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
                <p style="color: #666; margin: 0 0 15px 0;">Your verification code is:</p>
                <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; padding: 10px; background-color: #fff; border-radius: 4px; display: inline-block;">
                  ${token}
                </div>
              </div>
              <p style="color: #666; font-size: 14px; text-align: center; margin: 0;">
                This code will expire shortly. Please use it to complete your verification process.
              </p>
            </div>
          `,
        });
        return response;
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate OTP",
        });
      }
    }),
  verifyOtp: publicProcedure
    .input(z.object({ email: z.string(), token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authData = await verifyOtp(
        input.email,
        input.token,
        ctx.supabase,
        "signup",
      );

      // Check if user exists in our database
      const existingUser = await getUser(authData.user?.id ?? "");

      // If user doesn't exist, insert them
      if (!existingUser && authData.user) {
        await insertUser({
          id: authData.user.id,
          email: input.email,
          name: null,
        });
      }

      return authData;
    }),
  logout: publicProcedure.mutation(async () => {
    await logout();
  }),

  getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get user data from Supabase auth (source of truth)
      const {
        data: { user },
        error,
      } = await ctx.supabase.auth.getUser();

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found in auth system",
        });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.user_metadata?.full_name || null,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user profile",
      });
    }
  }),

  updateUserProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").optional(),
        email: z.string().email("Invalid email format").optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!input.name && !input.email) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "At least one field (name or email) must be provided",
          });
        }

        // Email updates are handled client-side for proper confirmation flow

        // Update name in Supabase auth user_metadata
        if (input.name) {
          const { data, error } = await ctx.supabase.auth.admin.updateUserById(
            ctx.userId,
            {
              user_metadata: { name: input.name },
            },
          );

          if (error) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: error.message,
            });
          }

          // Also update our users table to keep it in sync (optional)
          await updateUser(ctx.userId, { name: input.name });

          return {
            id: data.user.id,
            email: data.user.email,
            name: input.name,
            message: "Profile updated successfully.",
          };
        }

        // If only email was provided (handled client-side), return current auth data
        const {
          data: { user },
          error,
        } = await ctx.supabase.auth.getUser();
        if (error || !user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          id: user.id,
          email: user.email,
          name:
            user.user_metadata?.name || user.user_metadata?.full_name || null,
          message: "Profile updated successfully.",
        };
      } catch (error) {
        console.error("Error updating user profile:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user profile",
        });
      }
    }),

  clearAllUserData: protectedProcedure
    .input(
      z.object({
        confirmText: z
          .string()
          .refine(
            (text) => text === "DELETE ALL MY DATA",
            "You must type 'DELETE ALL MY DATA' to confirm",
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(`User ${ctx.userId} is requesting to clear all their data`);

        // Double check confirmation text
        if (input.confirmText !== "DELETE ALL MY DATA") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid confirmation text",
          });
        }

        // Clear all user data
        const result = await clearAllUserData(ctx.userId);

        console.log(
          `Successfully cleared all data for user ${ctx.userId}:`,
          result.deletedCounts,
        );

        return {
          success: true,
          message: `All your data has been cleared successfully. ${Object.values(
            result.deletedCounts,
          ).reduce((a, b) => a + b, 0)} records were deleted.`,
          deletedCounts: result.deletedCounts,
        };
      } catch (error) {
        console.error("Error clearing user data:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to clear user data",
        });
      }
    }),
});
