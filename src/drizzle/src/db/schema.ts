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
  unique,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

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
  "class",
]);

// export const workoutTimesEnum = pgEnum("workout_times", [
//   "early morning",
//   "mid morning",
//   "lunchtime",
//   "afternoon",
//   "evening",
//   "other",
// ]);

// export const weekendTimesEnum = pgEnum("weekend_workout_times", [
//   "no",
//   "sometimes",
//   "saturday",
//   "sunday",
//   "both",
//   "other",
// ]);

export const roleEnum = pgEnum("role", [
  "developer",
  "user",
  "assistant",
  "admin",
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "sent",
  "failed",
  "expired",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "workout_reminder",
  "progress_celebration",
  "motivation_boost",
]);

export const PilatesVideosParamsSchema = z.object({
  limit: z.number().int().positive().optional().default(5),
  offset: z.number().int().nonnegative().optional().default(0),
  difficulty: z.string().optional(),
  equipment: z.string().optional(),
  instructor: z.string().optional(),
  minDuration: z.number().nonnegative().optional(),
  maxDuration: z.number().nonnegative().optional(),
});

export type PilatesVideosParams = z.infer<typeof PilatesVideosParamsSchema>;

export const user = pgTable("user", {
  id: uuid("id").primaryKey().unique(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: roleEnum("role").default("user"),
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
  classId: uuid("class_id").references(() => PilatesVideos.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  activityType: activityTypeEnum("activity_type"),
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
  activityType: activityTypeEnum("activity_type").notNull(),
  date: timestamp("date").notNull(),
  durationHours: integer("duration_hours"),
  durationMinutes: integer("duration_minutes"),
  distance: text("distance"),
  distanceUnit: text("distance_unit"),
  notes: text("notes"),
  intensity: integer("intensity"),
  name: text("name"),
  likelyToDoAgain: integer("likely_to_do_again"),
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

  // name: text("name"),
  // age: integer("age"),
  // height: integer("height"),
  // weight: integer("weight"),
  // gender: text("gender"),

  // exercises: text("exercises").array(),
  // otherExercises: text("other_exercises").array(),
  // exerciseFrequency: text("exercise_frequency"),
  // sessionLength: text("session_length"),

  //health considerations
  injuries: boolean("injuries"),
  injuriesDetails: text("injuries_details"),
  recentSurgery: boolean("recent_surgery"),
  surgeryDetails: text("surgery_details"),
  chronicConditions: text("chronic_conditions").array(),
  otherHealthConditions: text("other_health_conditions").array(),
  pregnancy: text("pregnancy"),
  pregnancyConsultedDoctor: boolean("pregnancy_consulted_doctor"),
  pregnancyConsultedDoctorDetails: text("pregnancy_consulted_doctor_details"),

  // goalTimeline: text("goal_timeline"),

  //pilates
  fitnessLevel: text("fitness_level"),
  pilatesExperience: boolean("pilates_experience"),
  pilatesDuration: text("pilates_duration"),
  pilatesStyles: text("pilates_styles").array(),
  homeEquipment: text("home_equipment").array(),
  fitnessGoals: text("fitness_goals").array(),
  otherFitnessGoals: text("other_fitness_goals").array(),
  specificGoals: text("specific_goals"),

  motivation: text("motivation").array(),
  otherMotivation: text("other_motivation").array(),
  progressTracking: text("progress_tracking").array(),
  otherProgressTracking: text("other_progress_tracking").array(),

  // preferredWorkoutTimes: workoutTimesEnum("preferred_workout_times").array(),
  // avoidedWorkoutTimes: workoutTimesEnum("avoided_workout_times").array(),
  // weekendWorkoutTimes: weekendTimesEnum("weekend_workout_times"),
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
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
    type: text("type").notNull(), // 'question' or 'response'
    content: text("content").notNull(),
    context: jsonb("context"), // Store additional context like workout data, progress metrics, etc.
    parentId: uuid("parent_id"), // For linking questions to responses
    metadata: jsonb("metadata"), // For storing any additional metadata like sentiment, key topics, etc.
  },
);

export const progressTracking = pgTable("progress_tracking", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  workoutTrackingId: uuid("workout_tracking_id").references(
    () => workoutTracking.id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    },
  ),
  date: timestamp("date")
    .notNull()
    .default(sql`now()`),
  type: text("type").notNull(), // 'cardio' | 'pilates' | 'overall'
  metrics: jsonb("metrics").notNull().default({}), // Store duration, intensity, consistency, etc.
  achievements: text("achievements").array().default([]),
  challenges: text("challenges").array().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

export const AiSystemPrompt = pgTable("ai_system_prompt", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: text("name").notNull(),
  prompt: text("prompt").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const AiChatMessages = pgTable("ai_chat", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  role: roleEnum("role").notNull(),
  content: text("content").notNull(),
  toolCalls: jsonb("tool_calls").$type<
    Array<{
      id: string;
      type: string;
      function: {
        name: string;
        arguments: Record<string, any>;
      };
    }>
  >(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: notificationTypeEnum("type").default("motivation_boost"),
  scheduledTime: timestamp("scheduled_time"),
  sent: boolean("sent").default(false),
  sentAt: timestamp("sent_at"),
  deliveryStatus: deliveryStatusEnum("delivery_status").default("pending"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  enabledTypes: jsonb("enabled_types")
    .$type<string[]>()
    .default(["workout_reminder", "progress_celebration", "motivation_boost"]),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

export const PilatesVideos = pgTable("pilates_videos", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  duration: integer("duration").notNull(),
  equipment: text("equipment").notNull(),
  pilatesStyle: text("pilates_style").notNull(),
  classType: text("class_type").notNull(),
  focusArea: text("focus_area").notNull(),
  targetedMuscles: text("targeted_muscles").notNull(),
  intensity: integer("intensity").notNull(),
  modifications: boolean("modifications").notNull().default(true),
  beginnerFriendly: boolean("beginner_friendly").notNull().default(true),
  tags: text("tags").array().notNull(),
  exerciseSequence: text("exercise_sequence").array().notNull(),
  videoUrl: text("video_url").notNull(),
  muxAssetId: text("mux_asset_id"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
  mux_playback_id: text("mux_playback_id"),
  instructor: text("instructor"),
  thumbnailTimestamp: integer("thumbnail_timestamp").default(35),
});

export const classDrafts = pgTable(
  "class_drafts",
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
    sessionId: text("session_id").notNull(),
    muxAssetId: text("mux_asset_id"),
    muxPlaybackId: text("mux_playback_id"),
    chatHistory: jsonb("chat_history").$type<
      Array<{
        role: "user" | "assistant";
        content: string;
        timestamp: string;
      }>
    >(),
    extractedData: jsonb("extracted_data").$type<{
      title?: string;
      summary?: string;
      description?: string;
      difficulty?: string;
      duration?: number;
      equipment?: string;
      pilatesStyle?: string;
      classType?: string;
      focusArea?: string;
      targetedMuscles?: string;
      intensity?: number;
      modifications?: boolean;
      beginnerFriendly?: boolean;
      tags?: string;
      exerciseSequence?: string;
      instructor?: string;
    }>(),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => ({
    userSessionUnique: unique("user_session_unique").on(
      table.userId,
      table.sessionId,
    ),
  }),
);

export const appConfig = pgTable("app_config", {
  key: text("key").notNull().primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const waitlist = pgTable("waitlist", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  accessCode: text("access_code"),
  hasValidAccessCode: boolean("has_valid_access_code").notNull().default(false),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
});

// Enum for upload queue status
export const uploadStatusEnum = pgEnum("upload_status", [
  "pending",
  "uploading", 
  "processing",
  "completed",
  "failed",
  "cancelled"
]);

// Upload queue for multi-video CMS
export const uploadQueue = pgTable("upload_queue", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  fileSize: integer("file_size"),
  
  // Mux upload tracking
  muxUploadId: text("mux_upload_id"),
  muxAssetId: text("mux_asset_id"),
  muxPlaybackId: text("mux_playback_id"),
  
  // Upload status tracking
  uploadStatus: uploadStatusEnum("upload_status").notNull().default("pending"),
  uploadProgress: integer("upload_progress").notNull().default(0), // 0-100
  
  // AI content extraction status
  aiExtractionStatus: uploadStatusEnum("ai_extraction_status").notNull().default("pending"),
  aiExtractionProgress: integer("ai_extraction_progress").notNull().default(0), // 0-100
  
  // Error handling
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").notNull().default(0),
  maxRetries: integer("max_retries").notNull().default(3),
  
  // Timestamps
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  // Link to final video if successful
  pilatesVideoId: uuid("pilates_video_id").references(() => PilatesVideos.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});

// Custom Zod schemas for complex types
export const workoutTrackingInputSchema = z.object({
  userId: z.string().uuid(),
  workoutId: z.string().uuid().nullable().optional(),
  activityType: z.string(),
  date: z.date(),
  durationHours: z.number().int().nullable().optional(),
  durationMinutes: z.number().int().nullable().optional(),
  distance: z.string().nullable().optional(),
  distanceUnit: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  intensity: z.number().int().nullable().optional(),
  name: z.string().nullable().optional(),
  likelyToDoAgain: z.number().int().nullable().optional(),
  exercises: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        sets: z.array(
          z.object({
            id: z.string(),
            reps: z.number(),
            weight: z.number(),
          }),
        ),
      }),
    )
    .nullable()
    .optional(),
});

// Type exports for convenience - using the existing types from queries.ts
export type WorkoutTrackingInput = z.infer<typeof workoutTrackingInputSchema>;

export const insertUserSchema = createInsertSchema(user);
export const selectUserSchema = createSelectSchema(user);

export const insertWorkoutSchema = createInsertSchema(workout);
export const selectWorkoutSchema = createSelectSchema(workout);

export const insertWorkoutTrackingSchema = createInsertSchema(workoutTracking);
export const selectWorkoutTrackingSchema = createSelectSchema(workoutTracking);

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlan);

export const insertWeeklyScheduleSchema = createInsertSchema(weeklySchedule);
export const selectWeeklyScheduleSchema = createSelectSchema(weeklySchedule);

export const insertOnboardingSchema = createInsertSchema(onboarding);
export const selectOnboardingSchema = createSelectSchema(onboarding);

export const insertPersonalTrainerInteractionsSchema = createInsertSchema(
  personalTrainerInteractions,
);

export const insertAppConfigSchema = createInsertSchema(appConfig);
export const selectAppConfigSchema = createSelectSchema(appConfig);

export const insertWaitlistSchema = createInsertSchema(waitlist);
export const selectWaitlistSchema = createSelectSchema(waitlist);

export const insertUploadQueueSchema = createInsertSchema(uploadQueue);
export const selectUploadQueueSchema = createSelectSchema(uploadQueue);
