CREATE TYPE "public"."role" AS ENUM('developer', 'user', 'personal_trainer_ai');--> statement-breakpoint
CREATE TABLE "ai_chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"role" "role" NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_system_prompt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"prompt" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workout_plan" ADD COLUMN "ai_generated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_plan" ADD COLUMN "ai_explanation" text;--> statement-breakpoint
ALTER TABLE "ai_chat" ADD CONSTRAINT "ai_chat_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ai_system_prompt" ADD CONSTRAINT "ai_system_prompt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;