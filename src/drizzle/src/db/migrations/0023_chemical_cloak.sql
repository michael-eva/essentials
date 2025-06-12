ALTER TABLE "ai_chat" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('developer', 'user', 'assistant');--> statement-breakpoint
ALTER TABLE "ai_chat" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";