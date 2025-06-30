ALTER TABLE "onboarding" ADD COLUMN "pregnancy_consulted_doctor" boolean;--> statement-breakpoint
ALTER TABLE "onboarding" ADD COLUMN "pregnancy_consulted_doctor_details" text;--> statement-breakpoint
ALTER TABLE "progress_tracking" ADD COLUMN "workout_tracking_id" uuid;--> statement-breakpoint
ALTER TABLE "progress_tracking" ADD CONSTRAINT "progress_tracking_workout_tracking_id_workout_tracking_id_fk" FOREIGN KEY ("workout_tracking_id") REFERENCES "public"."workout_tracking"("id") ON DELETE cascade ON UPDATE cascade;