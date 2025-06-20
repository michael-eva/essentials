import { createTRPCRouter, publicProcedure } from "@essentials/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { verifyOtp } from "../../services/auth-helpers.js";
import SendEmail from "../../services/resend.js";
import { insertUser } from "../../drizzle/src/db/mutations.js";
import { getUser } from "../../drizzle/src/db/queries.js";

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
        "signup"
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
});
