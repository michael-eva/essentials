CREATE TYPE "public"."weekend_workout_times" AS ENUM('no', 'sometimes', 'saturday', 'sunday', 'both', 'other');--> statement-breakpoint
CREATE TYPE "public"."workout_times" AS ENUM('early morning', 'mid morning', 'lunchtime', 'afternoon', 'evening', 'other');--> statement-breakpoint
ALTER TABLE "onboarding" ALTER COLUMN "custom_apparatus" SET DATA TYPE text[] USING custom_apparatus::text[];--> statement-breakpoint
ALTER TABLE "onboarding" ADD COLUMN "preferred_workout_times" text[];--> statement-breakpoint
ALTER TABLE "onboarding" ADD COLUMN "avoided_workout_times" text[];--> statement-breakpoint
ALTER TABLE "onboarding" ADD COLUMN "weekend_workout_times" text[];