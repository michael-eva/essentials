DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'weekend_workout_times') THEN
    CREATE TYPE "public"."weekend_workout_times" AS ENUM('no', 'sometimes', 'saturday', 'sunday', 'both', 'other');
  END IF;
END$$;

ALTER TABLE "onboarding" ALTER COLUMN "custom_apparatus" SET DATA TYPE text[] USING custom_apparatus::text[];--> statement-breakpoint
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
    ALTER TABLE "onboarding" ADD COLUMN "avoided_workout_times" text[];
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='onboarding' AND column_name='weekend_workout_times'
  ) THEN
    ALTER TABLE "onboarding" ADD COLUMN "weekend_workout_times" text[];
  END IF;
END$$;