CREATE TYPE "workout_type" AS ENUM ('class', 'workout');
--> statement-breakpoint
CREATE TYPE "workout_status" AS ENUM ('completed', 'not_completed', 'not_recorded');
--> statement-breakpoint


CREATE TABLE "user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "weekly_schedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"week_number" integer NOT NULL,
	"workout_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"instructor" text NOT NULL,
	"duration" integer NOT NULL,
	"description" text NOT NULL,
	"level" text NOT NULL,
	"booked_date" timestamp,
	"type" "workout_type" NOT NULL,
	"status" "workout_status" DEFAULT 'not_recorded',
	"is_booked" boolean DEFAULT false NOT NULL,
	"class_id" integer,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_name" text NOT NULL,
	"weeks" integer NOT NULL,
	"saved_at" timestamp NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp,
	"is_active" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workout_id" uuid NOT NULL,
	"journal_entry" text,
	"time_logged" integer,
	"date_logged" text,
	"name" text,
	CONSTRAINT "workout_tracking_workout_id_unique" UNIQUE("workout_id")
);
--> statement-breakpoint
ALTER TABLE "weekly_schedule" ADD CONSTRAINT "weekly_schedule_plan_id_workout_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."workout_plan"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "weekly_schedule" ADD CONSTRAINT "weekly_schedule_workout_id_workout_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workout" ADD CONSTRAINT "workout_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workout_plan" ADD CONSTRAINT "workout_plan_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workout_tracking" ADD CONSTRAINT "workout_tracking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workout_tracking" ADD CONSTRAINT "workout_tracking_workout_id_workout_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE cascade;


