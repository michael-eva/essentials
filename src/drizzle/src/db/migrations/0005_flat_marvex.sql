CREATE TYPE "public"."notification_tone" AS ENUM('motivational', 'gentle', 'challenging', 'friendly', 'professional');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('workout_reminder', 'progress_celebration', 'motivation_boost', 'goal_check_in', 'accountability_nudge', 'streak_celebration', 'recovery_reminder');--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"enabled_types" jsonb DEFAULT '["workout_reminder","progress_celebration","motivation_boost"]'::jsonb,
	"tone" "notification_tone" DEFAULT 'motivational',
	"preferred_times" jsonb DEFAULT '["morning","afternoon"]'::jsonb,
	"focus_areas" jsonb DEFAULT '["accountability","encouragement","goal_tracking"]'::jsonb,
	"frequency" text DEFAULT 'daily',
	"quiet_hours" jsonb DEFAULT '{"start":"22:00","end":"07:00"}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "type" "notification_type" DEFAULT 'motivation_boost';--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;