CREATE TYPE "public"."upload_status" AS ENUM('pending', 'uploading', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "upload_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"file_size" integer,
	"mux_upload_id" text,
	"mux_asset_id" text,
	"mux_playback_id" text,
	"upload_status" "upload_status" DEFAULT 'pending' NOT NULL,
	"upload_progress" integer DEFAULT 0 NOT NULL,
	"ai_extraction_status" "upload_status" DEFAULT 'pending' NOT NULL,
	"ai_extraction_progress" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"pilates_video_id" uuid
);
--> statement-breakpoint
-- Waitlist table and constraints already exist from previous migrations
--> statement-breakpoint
ALTER TABLE "upload_queue" ADD CONSTRAINT "upload_queue_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "upload_queue" ADD CONSTRAINT "upload_queue_pilates_video_id_pilates_videos_id_fk" FOREIGN KEY ("pilates_video_id") REFERENCES "public"."pilates_videos"("id") ON DELETE set null ON UPDATE cascade;