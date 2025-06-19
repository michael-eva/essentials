ALTER TYPE "public"."activity_type" ADD VALUE 'workout';--> statement-breakpoint
ALTER TABLE "workout_tracking" ADD COLUMN "exercises" jsonb;