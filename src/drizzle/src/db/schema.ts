import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  boolean,
  pgEnum,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const workoutTypeEnum = pgEnum("workout_type", ["class", "workout"]);
export const workoutStatusEnum = pgEnum("workout_status", [
  "completed",
  "not_completed",
  "not_recorded",
]);

export const user = pgTable("user", {
  id: uuid("id").primaryKey().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
});

export const workout = pgTable("workout", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  instructor: text("instructor").notNull(),
  duration: integer("duration").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(),
  bookedDate: timestamp("booked_date"),
  type: workoutTypeEnum("type").notNull(),
  status: workoutStatusEnum("status").default("not_recorded"),
  isBooked: boolean("is_booked").notNull().default(false),
  classId: integer("class_id"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export const workoutTracking = pgTable("workout_tracking", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  workoutId: uuid("workout_id"),
  activityType: text("activity_type").notNull(),
  date: timestamp("date").notNull(),
  durationHours: integer("duration_hours"),
  durationMinutes: integer("duration_minutes"),
  distance: text("distance"),
  distanceUnit: text("distance_unit"),
  notes: text("notes"),
  ratings: text("ratings").array(),
  name: text("name"),
  wouldDoAgain: boolean("would_do_again"),
});

export const workoutPlan = pgTable("workout_plan", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  planName: text("plan_name").notNull(),
  weeks: integer("weeks").notNull(),
  savedAt: timestamp("saved_at").notNull(),
  archived: boolean("archived").notNull().default(false),
  archivedAt: timestamp("archived_at"),
  isActive: boolean("is_active").notNull().default(false),
  startDate: timestamp("start_date"),
  pausedAt: timestamp("paused_at"),
  resumedAt: timestamp("resumed_at"),
  totalPausedDuration: integer("total_paused_duration").notNull().default(0),
});

export const weeklySchedule = pgTable("weekly_schedule", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  planId: uuid("plan_id")
    .notNull()
    .references(() => workoutPlan.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  weekNumber: integer("week_number").notNull(),
  workoutId: uuid("workout_id")
    .notNull()
    .references(() => workout.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export const onboarding = pgTable("onboarding", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id)
    .unique(),
  step: text("step").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),

  name: text("name"),
  age: integer("age"),
  height: integer("height"),
  weight: integer("weight"),
  gender: text("gender"),

  fitnessLevel: text("fitness_level"),
  exercises: text("exercises").array(),
  otherExercises: text("other_exercises").array(),
  exerciseFrequency: text("exercise_frequency"),
  sessionLength: text("session_length"),

  injuries: boolean("injuries"),
  injuriesDetails: text("injuries_details"),
  recentSurgery: boolean("recent_surgery"),
  surgeryDetails: text("surgery_details"),
  chronicConditions: text("chronic_conditions").array(),
  otherHealthConditions: text("other_health_conditions").array(),
  pregnancy: text("pregnancy"),

  fitnessGoals: text("fitness_goals").array(),
  goalTimeline: text("goal_timeline"),
  specificGoals: text("specific_goals"),

  pilatesExperience: boolean("pilates_experience"),
  pilatesDuration: text("pilates_duration"),
  studioFrequency: text("studio_frequency"),
  sessionPreference: text("session_preference"),
  instructors: text("instructors").array(),
  customInstructor: text("custom_instructor"),
  apparatusPreference: text("apparatus_preference").array(),
  customApparatus: text("custom_apparatus"),

  motivation: text("motivation").array(),
  otherMotivation: text("other_motivation").array(),
  progressTracking: text("progress_tracking").array(),
  otherProgressTracking: text("other_progress_tracking").array(),
});
