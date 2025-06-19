-- First, add a temporary column to hold the new integer values
ALTER TABLE "workout_tracking" ADD COLUMN "intensity_temp" integer;

-- Update the temporary column with converted values
-- If intensity is an array, take the length as a rough conversion
-- If it's null or empty, default to 5
UPDATE "workout_tracking" 
SET "intensity_temp" = CASE 
  WHEN intensity IS NULL THEN 5
  WHEN array_length(intensity, 1) IS NULL THEN 5
  ELSE LEAST(GREATEST(array_length(intensity, 1), 1), 10)
END;

-- Drop the old column
ALTER TABLE "workout_tracking" DROP COLUMN "intensity";

-- Rename the temporary column
ALTER TABLE "workout_tracking" RENAME COLUMN "intensity_temp" TO "intensity";