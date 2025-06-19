ALTER TABLE "workout_plan" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "workout_plan" ADD COLUMN "paused_at" timestamp;--> statement-breakpoint
ALTER TABLE "workout_plan" ADD COLUMN "resumed_at" timestamp;--> statement-breakpoint
ALTER TABLE "workout_plan" ADD COLUMN "total_paused_duration" integer DEFAULT 0 NOT NULL;