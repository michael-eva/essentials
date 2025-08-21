ALTER TYPE "public"."role" ADD VALUE 'admin';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "role" DEFAULT 'user';