CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'sent', 'failed', 'expired');--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "delivery_status" "delivery_status" DEFAULT 'pending';