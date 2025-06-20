import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  boolean,
  pgEnum,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";

export const workoutTypeEnum = pgEnum("workout_type", ["class", "workout"]);
export const workoutStatusEnum = pgEnum("workout_status", [
  "completed",
  "not_completed",
  "not_recorded",
]);
export const activityTypeEnum = pgEnum("activity_type", [
  "run",
  "cycle",
  "swim",
  "walk",
  "hike",
  "rowing",
  "elliptical",
  "workout",
]);

export const roleEnum = pgEnum("role", ["developer", "user", "assistant"]);

export const user = pgTable("user", {
  id: uuid("id").primaryKey().unique(),
  email: text("email").notNull().unique(),
  name: text("name"),
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
  activityType: activityTypeEnum("activity_type"),
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
  intensity: integer("intensity"),
  name: text("name"),
  wouldDoAgain: boolean("would_do_again"),
  exercises: jsonb("exercises").$type<
    Array<{
      id: string;
      name: string;
      sets: Array<{
        id: string;
        reps: number;
        weight: number;
      }>;
    }>
  >(),
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
  isAI: boolean("ai_generated").notNull().default(false),
  explanation: text("ai_explanation"),
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
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
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
  apparatusPreference: text("apparatus_preference").array(),
  customApparatus: text("custom_apparatus"),

  motivation: text("motivation").array(),
  otherMotivation: text("other_motivation").array(),
  progressTracking: text("progress_tracking").array(),
  otherProgressTracking: text("other_progress_tracking").array(),
});

export const personalTrainerInteractions = pgTable(
  "personal_trainer_interactions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    interactionType: text("interaction_type").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
  }
);

// Export types for use in other packages
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Workout = typeof workout.$inferSelect;
export type NewWorkout = typeof workout.$inferInsert;

export type WorkoutTracking = typeof workoutTracking.$inferSelect;
export type NewWorkoutTracking = typeof workoutTracking.$inferInsert;

export type WorkoutPlan = typeof workoutPlan.$inferSelect;
export type NewWorkoutPlan = typeof workoutPlan.$inferInsert;

export type WeeklySchedule = typeof weeklySchedule.$inferSelect;
export type NewWeeklySchedule = typeof weeklySchedule.$inferInsert;

export type Onboarding = typeof onboarding.$inferSelect;
export type NewOnboarding = typeof onboarding.$inferInsert;

export type PersonalTrainerInteraction = typeof personalTrainerInteractions.$inferSelect;
export type NewPersonalTrainerInteraction = typeof personalTrainerInteractions.$inferInsert;
