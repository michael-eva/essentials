import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import { insertWaitlist } from "@/drizzle/src/db/mutations";
import { 
  insertWaitlistWithReferral, 
  validateReferralCode,
  getUserReferralAnalytics,
  generateReferralLink 
} from "@/services/referral";
import SendEmail from "@/services/resend";

// Get the access code from environment variables

export const waitlistRouter = createTRPCRouter({
  // Submit waitlist form
  submitWaitlist: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(1, "Full name is required"),
        email: z.string().email("Please enter a valid email address"),
        accessCode: z.string().optional(),
        referrerId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const hasValidAccessCode =
          input.accessCode === env.WAITLIST_ACCESS_CODE;

        // If referrerId provided, validate it exists
        if (input.referrerId) {
          const isValidReferrer = await validateReferralCode(input.referrerId);
          if (!isValidReferrer) {
            console.warn(`Invalid referrer ID: ${input.referrerId}`);
            // Continue without referral rather than failing
          }
        }

        // Use the enhanced waitlist insertion with referral processing
        const result = await insertWaitlistWithReferral({
          fullName: input.fullName,
          email: input.email,
          accessCode: input.accessCode || null,
          hasValidAccessCode,
          referrerId: input.referrerId,
        });

        // Generate referral link for the new user
        const referralLink = generateReferralLink(result.waitlistEntry.id);

        return {
          success: true,
          hasValidAccessCode,
          userId: result.waitlistEntry.id,
          referralLink,
          rewards: result.rewards,
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

  // Get referral analytics for a user
  getReferralAnalytics: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const analytics = await getUserReferralAnalytics(input.userId);
        return analytics;
      } catch (error) {
        console.error("Error fetching referral analytics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch referral analytics.",
        });
      }
    }),

  // Generate referral link for a user
  generateReferralLink: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      try {
        // Verify user exists in waitlist
        const isValid = await validateReferralCode(input.userId);
        if (!isValid) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found in waitlist.",
          });
        }

        const referralLink = generateReferralLink(input.userId);
        return { referralLink };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error generating referral link:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate referral link.",
        });
      }
    }),

  // Send referral invitations via email
  sendReferralInvitations: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        emails: z.array(z.string().email()).min(1, "At least one email is required").max(10, "Maximum 10 emails allowed"),
        referralLink: z.string().url(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Verify user exists in waitlist
        const isValid = await validateReferralCode(input.userId);
        if (!isValid) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found in waitlist.",
          });
        }

        // Send referral invitations via email
        const emailPromises = input.emails.map(email => 
          SendEmail({
            to: email,
            subject: 'Join me on the Essentials waitlist!',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>You've been invited to join Essentials!</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <h1 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 28px;">You've been invited to join Essentials!</h1>
                      <p style="color: #666; font-size: 16px; margin: 0;">Your friend has invited you to join the Essentials waitlist.</p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
                      <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 24px;">🎉 Special Offer</h2>
                      <p style="color: #666; font-size: 18px; margin: 0 0 20px 0;">Join now and get <strong>2 free months</strong> when we launch!</p>
                      
                      <a href="${input.referralLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; margin: 10px 0;">Join Waitlist Now</a>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 30px;">
                      <h3 style="color: #2c3e50; margin: 0 0 15px 0;">What is Essentials?</h3>
                      <p style="color: #666; line-height: 1.6; margin: 0 0 15px 0;">Essentials is your personal fitness companion, offering AI-powered workout plans, pilates sessions, and personalized training to help you achieve your health goals.</p>
                    </div>
                    
                    <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                      <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">Can't click the button? Copy and paste this link:</p>
                      <p style="color: #667eea; font-size: 14px; word-break: break-all; margin: 0;">${input.referralLink}</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                      <p style="color: #999; font-size: 12px; margin: 0;">Thanks for joining our community!</p>
                      <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">The Essentials Team</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          })
        );
        
        const results = await Promise.all(emailPromises);
        
        // Check if any emails failed
        const failedEmails = results.filter(result => result.error);
        if (failedEmails.length > 0) {
          console.error('Some emails failed to send:', failedEmails);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to send ${failedEmails.length} email(s). Please try again.`,
          });
        }

        console.log(`Successfully sent ${input.emails.length} referral invitations from user ${input.userId}`);
        console.log(`Referral link: ${input.referralLink}`);

        return {
          success: true,
          emailsSent: input.emails.length,
          message: `Successfully sent ${input.emails.length} invitation${input.emails.length > 1 ? 's' : ''}!`,
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error sending referral invitations:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send referral invitations.",
        });
      }
    }),
});
