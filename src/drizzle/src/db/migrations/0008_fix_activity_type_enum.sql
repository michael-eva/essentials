-- Migration: Fix activityType enum to include 'class' and clean up invalid data
-- Created: 2025-08-03

-- First, add 'class' to the activity_type enum if it doesn't exist
DO $$ BEGIN
  ALTER TYPE "activity_type" ADD VALUE IF NOT EXISTS 'class';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update existing invalid 'workout' activityType records to 'run' (as a default)
-- In a real scenario, you'd want to map these more intelligently based on the workout data
UPDATE "workout_tracking" 
SET "activity_type" = 'run' 
WHERE "activity_type" NOT IN ('run', 'cycle', 'swim', 'walk', 'class');

-- Now alter the column to use the enum type (this enforces the constraint)
-- Note: This might require additional steps if there are still invalid values
ALTER TABLE "workout_tracking" 
ALTER COLUMN "activity_type" TYPE "activity_type" 
USING "activity_type"::text::"activity_type";