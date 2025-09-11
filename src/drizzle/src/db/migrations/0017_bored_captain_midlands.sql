-- Create enum type with error handling
DO $$ BEGIN
  CREATE TYPE "public"."referral_transaction_type" AS ENUM('base_signup', 'referral_bonus', 'referrer_reward');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS "referral_analytics" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"total_referrals" integer DEFAULT 0 NOT NULL,
	"total_free_months" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "referral_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_type" "referral_transaction_type" NOT NULL,
	"months_count" integer NOT NULL,
	"description" text,
	"referred_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Add column if it doesn't exist
DO $$ BEGIN
  ALTER TABLE "waitlist" ADD COLUMN "referrer_id" uuid;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;--> statement-breakpoint
-- Add foreign key constraints with error handling
DO $$ BEGIN
  ALTER TABLE "referral_analytics" ADD CONSTRAINT "referral_analytics_user_id_waitlist_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."waitlist"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "referral_transactions" ADD CONSTRAINT "referral_transactions_user_id_waitlist_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."waitlist"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "referral_transactions" ADD CONSTRAINT "referral_transactions_referred_user_id_waitlist_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."waitlist"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_referrer_id_waitlist_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."waitlist"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;