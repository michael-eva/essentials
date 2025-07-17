ALTER TABLE "workout" ALTER COLUMN "activity_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."activity_type";--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('run', 'cycle', 'swim', 'walk');--> statement-breakpoint
ALTER TABLE "workout" ALTER COLUMN "activity_type" SET DATA TYPE "public"."activity_type" USING "activity_type"::"public"."activity_type";--> statement-breakpoint
ALTER TABLE "onboarding" ADD COLUMN "pilates_styles" text[];--> statement-breakpoint
ALTER TABLE "onboarding" ADD COLUMN "home_equipment" text[];--> statement-breakpoint
ALTER TABLE "onboarding" DROP COLUMN "studio_frequency";--> statement-breakpoint
ALTER TABLE "onboarding" DROP COLUMN "session_preference";--> statement-breakpoint
ALTER TABLE "onboarding" DROP COLUMN "apparatus_preference";--> statement-breakpoint
ALTER TABLE "onboarding" DROP COLUMN "other_apparatus_preference";--> statement-breakpoint
ALTER TABLE "onboarding" DROP COLUMN "custom_apparatus";--> statement-breakpoint
ALTER TABLE "onboarding" DROP COLUMN "other_custom_apparatus";