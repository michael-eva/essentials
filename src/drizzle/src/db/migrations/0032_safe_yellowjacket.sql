ALTER TABLE "onboarding" ALTER COLUMN "preferred_workout_times" SET DATA TYPE "public"."workout_times"[] USING "preferred_workout_times"::"public"."workout_times"[];
--> statement-breakpoint
ALTER TABLE "onboarding" ALTER COLUMN "avoided_workout_times" SET DATA TYPE "public"."workout_times"[] USING "avoided_workout_times"::"public"."workout_times"[];
--> statement-breakpoint
ALTER TABLE "onboarding" ALTER COLUMN "weekend_workout_times" SET DATA TYPE "public"."weekend_workout_times" USING "weekend_workout_times"[1]::"public"."weekend_workout_times";