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
  id: uuid("id").primaryKey(),
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
