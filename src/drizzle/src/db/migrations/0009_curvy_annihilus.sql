CREATE TABLE "class_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" text NOT NULL,
	"mux_asset_id" text,
	"mux_playback_id" text,
	"chat_history" jsonb,
	"extracted_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_session_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
ALTER TABLE "class_drafts" ADD CONSTRAINT "class_drafts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;