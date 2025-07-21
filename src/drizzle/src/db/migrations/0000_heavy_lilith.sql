CREATE TYPE "public"."activity_type" AS ENUM('run', 'cycle', 'swim', 'walk');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('developer', 'user', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."workout_status" AS ENUM('completed', 'not_completed', 'not_recorded');--> statement-breakpoint
CREATE TYPE "public"."workout_type" AS ENUM('class', 'workout');--> statement-breakpoint
CREATE TABLE "ai_chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"role" "role" NOT NULL,
	"content" text NOT NULL,
	"tool_calls" jsonb
);
--> statement-breakpoint
CREATE TABLE "ai_system_prompt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"prompt" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pilates_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" text NOT NULL,
	"duration" integer NOT NULL,
	"equipment" text NOT NULL,
	"pilates_style" text NOT NULL,
	"class_type" text NOT NULL,
	"focus_area" text NOT NULL,
	"targeted_muscles" text NOT NULL,
	"intensity" integer NOT NULL,
	"modifications" boolean DEFAULT true NOT NULL,
	"beginner_friendly" boolean DEFAULT true NOT NULL,
	"tags" text NOT NULL,
	"exercise_sequence" text NOT NULL,
	"video_url" text NOT NULL,
	"mux_asset_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"mux_playback_id" text,
	"instructor" text
);
--> statement-breakpoint
CREATE TABLE "onboarding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"step" text NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"injuries" boolean,
	"injuries_details" text,
	"recent_surgery" boolean,
	"surgery_details" text,
	"chronic_conditions" text[],
	"other_health_conditions" text[],
	"pregnancy" text,
	"pregnancy_consulted_doctor" boolean,
	"pregnancy_consulted_doctor_details" text,
	"fitness_level" text,
	"pilates_experience" boolean,
	"pilates_duration" text,
	"pilates_styles" text[],
	"home_equipment" text[],
	"fitness_goals" text[],
	"other_fitness_goals" text[],
	"specific_goals" text,
	"motivation" text[],
	"other_motivation" text[],
	"progress_tracking" text[],
	"other_progress_tracking" text[],
	CONSTRAINT "onboarding_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "personal_trainer_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"context" jsonb,
	"parent_id" uuid,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "progress_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workout_tracking_id" uuid,
	"date" timestamp DEFAULT now() NOT NULL,
	"type" text NOT NULL,
	"metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"achievements" text[] DEFAULT '{}',
	"challenges" text[] DEFAULT '{}',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	CONSTRAINT "user_id_unique" UNIQUE("id"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "weekly_schedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"week_number" integer NOT NULL,
	"workout_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"instructor" text NOT NULL,
	"duration" integer NOT NULL,
	"description" text NOT NULL,
	"level" text NOT NULL,
	"booked_date" timestamp,
	"type" "workout_type" NOT NULL,
	"status" "workout_status" DEFAULT 'not_recorded',
	"is_booked" boolean DEFAULT false NOT NULL,
	"class_id" uuid,
	"user_id" uuid NOT NULL,
	"activity_type" "activity_type",
	"exercises" jsonb
);
--> statement-breakpoint
CREATE TABLE "workout_plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_name" text NOT NULL,
	"weeks" integer NOT NULL,
	"saved_at" timestamp NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp,
	"is_active" boolean DEFAULT false NOT NULL,
	"start_date" timestamp,
	"paused_at" timestamp,
	"resumed_at" timestamp,
	"total_paused_duration" integer DEFAULT 0 NOT NULL,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"ai_explanation" text
);
--> statement-breakpoint
CREATE TABLE "workout_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workout_id" uuid,
	"activity_type" text NOT NULL,
	"date" timestamp NOT NULL,
	"duration_hours" integer,
	"duration_minutes" integer,
	"distance" text,
	"distance_unit" text,
	"notes" text,
	"intensity" integer,
	"name" text,
	"likely_to_do_again" integer,
	"exercises" jsonb
);
--> statement-breakpoint
ALTER TABLE "ai_chat" ADD CONSTRAINT "ai_chat_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ai_system_prompt" ADD CONSTRAINT "ai_system_prompt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "onboarding" ADD CONSTRAINT "onboarding_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "personal_trainer_interactions" ADD CONSTRAINT "personal_trainer_interactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "progress_tracking" ADD CONSTRAINT "progress_tracking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "progress_tracking" ADD CONSTRAINT "progress_tracking_workout_tracking_id_workout_tracking_id_fk" FOREIGN KEY ("workout_tracking_id") REFERENCES "public"."workout_tracking"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "weekly_schedule" ADD CONSTRAINT "weekly_schedule_plan_id_workout_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."workout_plan"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "weekly_schedule" ADD CONSTRAINT "weekly_schedule_workout_id_workout_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workout" ADD CONSTRAINT "workout_class_id_pilates_videos_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."pilates_videos"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workout" ADD CONSTRAINT "workout_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workout_plan" ADD CONSTRAINT "workout_plan_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workout_tracking" ADD CONSTRAINT "workout_tracking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;