CREATE TYPE "public"."activity_type" AS ENUM('run', 'cycle', 'swim', 'walk', 'hike', 'rowing', 'elliptical');--> statement-breakpoint
ALTER TABLE "workout" ADD COLUMN "activity_type" "activity_type";