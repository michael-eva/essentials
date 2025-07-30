ALTER TABLE "notification_preferences" DROP COLUMN "tone";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "preferred_times";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "focus_areas";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "frequency";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "quiet_hours";--> statement-breakpoint
DROP TYPE "public"."notification_tone";