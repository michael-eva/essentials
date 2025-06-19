CREATE TABLE "personal_trainer_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"context" jsonb,
	"parent_id" uuid,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "personal_trainer_interactions" ADD CONSTRAINT "personal_trainer_interactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "personal_trainer_interactions" ADD CONSTRAINT "personal_trainer_interactions_parent_id_personal_trainer_interactions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."personal_trainer_interactions"("id") ON DELETE no action ON UPDATE no action;