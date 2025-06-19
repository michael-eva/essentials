ALTER TABLE "workout_tracking" ADD COLUMN "activity_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_tracking" ADD COLUMN "date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_tracking" ADD COLUMN "duration_hours" integer;--> statement-breakpoint
ALTER TABLE "workout_tracking" ADD COLUMN "duration_minutes" integer;--> statement-breakpoint
ALTER TABLE "workout_tracking" ADD COLUMN "distance" text;--> statement-breakpoint
ALTER TABLE "workout_tracking" ADD COLUMN "distance_unit" text;--> statement-breakpoint
ALTER TABLE "workout_tracking" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "workout_tracking" ADD COLUMN "ratings" text[];