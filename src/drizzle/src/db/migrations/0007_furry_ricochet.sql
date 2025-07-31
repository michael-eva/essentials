ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'motivation_boost'::text;--> statement-breakpoint
DROP TYPE "public"."notification_type";--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('workout_reminder', 'progress_celebration', 'motivation_boost');--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'motivation_boost'::"public"."notification_type";--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE "public"."notification_type" USING "type"::"public"."notification_type";