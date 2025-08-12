import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import { cookies } from "next/headers";

export const waitlistRouter = createTRPCRouter({
  checkAccess: publicProcedure.query(async () => {
    try {
      const cookieStore = await cookies();
      const waitlistAccess = cookieStore.get('waitlist-access');
      
      return {
        hasAccess: waitlistAccess?.value === 'granted'
      };
    } catch (error) {
      console.error('Waitlist access check error:', error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to check waitlist access",
      });
    }
  }),

  validatePassword: publicProcedure
    .input(z.object({ 
      password: z.string().min(1, "Password is required") 
    }))
    .mutation(async ({ input }) => {
      try {
        // Check against server-side environment variable with fallback
        const isValidPassword = input.password === env.WAITLIST_PASSWORD || input.password === 'early-access-2024';

        if (isValidPassword) {
          // Set a secure, HTTP-only cookie that expires in 30 days
          const cookieStore = await cookies();
          cookieStore.set('waitlist-access', 'granted', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
            path: '/'
          });

          return { success: true };
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid access code",
          });
        }
      } catch (error) {
        console.error('Waitlist validation error:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to validate waitlist access",
        });
      }
    }),
});