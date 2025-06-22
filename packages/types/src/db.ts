// Import types from the database package
// These types are generated from the Drizzle schema using $inferSelect and $inferInsert

export type {
  User,
  NewUser,
  Workout,
  NewWorkout,
  WorkoutTracking,
  NewWorkoutTracking,
  WorkoutPlan,
  NewWorkoutPlan,
  WeeklySchedule,
  NewWeeklySchedule,
  Onboarding,
  NewOnboarding,
  PersonalTrainerInteraction,
  NewPersonalTrainerInteraction,
} from "@essentials/database";

// Export enum values (not types)
export {
  activityTypeEnum,
  workoutTypeEnum,
  workoutStatusEnum,
  roleEnum,
} from "@essentials/database";
