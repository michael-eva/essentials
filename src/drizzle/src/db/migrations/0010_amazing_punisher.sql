-- Convert existing text data to arrays before changing column types
-- Handle tags column: convert JSON strings and comma-separated strings to arrays
UPDATE "pilates_videos" 
SET "tags" = CASE 
  WHEN "tags" LIKE '[%]' THEN string_to_array(trim(both '[]"' from "tags"), '","')
  WHEN "tags" LIKE '%,%' THEN string_to_array("tags", ',')
  ELSE ARRAY["tags"]
END;

-- Handle exercise_sequence column: convert JSON strings and comma-separated strings to arrays
UPDATE "pilates_videos" 
SET "exercise_sequence" = CASE 
  WHEN "exercise_sequence" LIKE '[%]' THEN string_to_array(trim(both '[]"' from "exercise_sequence"), '","')
  WHEN "exercise_sequence" LIKE '%,%' THEN string_to_array("exercise_sequence", ',')
  ELSE ARRAY["exercise_sequence"]
END;

-- Now change the column types to arrays using USING clause
ALTER TABLE "pilates_videos" ALTER COLUMN "tags" TYPE text[] USING "tags"::text[];
ALTER TABLE "pilates_videos" ALTER COLUMN "exercise_sequence" TYPE text[] USING "exercise_sequence"::text[];