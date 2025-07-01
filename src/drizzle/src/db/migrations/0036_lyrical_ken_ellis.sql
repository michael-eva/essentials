DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'weekend_workout_times') THEN
    CREATE TYPE weekend_workout_times AS ENUM ('no', 'sometimes', 'saturday', 'sunday', 'both', 'other');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workout_times') THEN
    CREATE TYPE "public"."workout_times" AS ENUM('early morning', 'mid morning', 'lunchtime', 'afternoon', 'evening', 'other');
  END IF;
END$$;

ALTER TYPE "public"."activity_type" ADD VALUE 'weightlift';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'dance';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'team sports';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'pilates';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'bodyweight';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'resistance';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'other';--> statement-breakpoint
ALTER TABLE "onboarding" ADD COLUMN "pregnancy_consulted_doctor" boolean;--> statement-breakpoint
ALTER TABLE "onboarding" ADD COLUMN "pregnancy_consulted_doctor_details" text;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='onboarding' AND column_name='preferred_workout_times'
  ) THEN
    ALTER TABLE "onboarding" ADD COLUMN "preferred_workout_times" text[];
  END IF;
END$$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='onboarding' AND column_name='avoided_workout_times'
  ) THEN
    ALTER TABLE "onboarding" ADD COLUMN "avoided_workout_times" "workout_times"[];
  END IF;
END$$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='onboarding' AND column_name='weekend_workout_times'
  ) THEN
    ALTER TABLE "onboarding" ADD COLUMN "weekend_workout_times" "weekend_workout_times";
  END IF;
END$$;