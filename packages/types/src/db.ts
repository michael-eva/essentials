// For now, we'll define the core types here until the database package builds
// These will be replaced with imports from @essentials/database once it's built

export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export interface NewUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface Workout {
  id: string;
  name: string;
  instructor: string;
  duration: number;
  description: string;
  level: string;
  bookedDate?: Date | null;
  type: "class" | "workout";
  status?: "completed" | "not_completed" | "not_recorded" | null;
  isBooked: boolean;
  classId?: number | null;
  userId: string;
  activityType?: "run" | "cycle" | "swim" | "walk" | "hike" | "rowing" | "elliptical" | "workout" | null;
}

export interface NewWorkout {
  id?: string;
  name: string;
  instructor: string;
  duration: number;
  description: string;
  level: string;
  bookedDate?: Date | null;
  type: "class" | "workout";
  status?: "completed" | "not_completed" | "not_recorded" | null;
  isBooked?: boolean;
  classId?: number | null;
  userId: string;
  activityType?: "run" | "cycle" | "swim" | "walk" | "hike" | "rowing" | "elliptical" | "workout" | null;
}

export interface WorkoutTracking {
  id: string;
  userId: string;
  workoutId?: string | null;
  activityType: string;
  date: Date;
  durationHours?: number | null;
  durationMinutes?: number | null;
  distance?: string | null;
  distanceUnit?: string | null;
  notes?: string | null;
  intensity?: number | null;
  name?: string | null;
  wouldDoAgain?: boolean | null;
  exercises?: Array<{
    id: string;
    name: string;
    sets: Array<{
      id: string;
      reps: number;
      weight: number;
    }>;
  }> | null;
}

export interface NewWorkoutTracking {
  id?: string;
  userId: string;
  workoutId?: string | null;
  activityType: string;
  date: Date;
  durationHours?: number | null;
  durationMinutes?: number | null;
  distance?: string | null;
  distanceUnit?: string | null;
  notes?: string | null;
  intensity?: number | null;
  name?: string | null;
  wouldDoAgain?: boolean | null;
  exercises?: Array<{
    id: string;
    name: string;
    sets: Array<{
      id: string;
      reps: number;
      weight: number;
    }>;
  }> | null;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  planName: string;
  weeks: number;
  savedAt: Date;
  archived: boolean;
  archivedAt?: Date | null;
  isActive: boolean;
  startDate?: Date | null;
  pausedAt?: Date | null;
  resumedAt?: Date | null;
  totalPausedDuration: number;
  isAI: boolean;
  explanation?: string | null;
}

export interface NewWorkoutPlan {
  id?: string;
  userId: string;
  planName: string;
  weeks: number;
  savedAt?: Date;
  archived?: boolean;
  archivedAt?: Date | null;
  isActive?: boolean;
  startDate?: Date | null;
  pausedAt?: Date | null;
  resumedAt?: Date | null;
  totalPausedDuration?: number;
  isAI?: boolean;
  explanation?: string | null;
}

export interface WeeklySchedule {
  id: string;
  planId: string;
  weekNumber: number;
  workoutId: string;
}

export interface NewWeeklySchedule {
  id?: string;
  planId: string;
  weekNumber: number;
  workoutId: string;
}

export interface Onboarding {
  id: string;
  userId: string;
  step: string;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  name?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  gender?: string | null;
  fitnessLevel?: string | null;
  exercises?: string[] | null;
  otherExercises?: string[] | null;
  exerciseFrequency?: string | null;
  sessionLength?: string | null;
  injuries?: boolean | null;
  injuriesDetails?: string | null;
  recentSurgery?: boolean | null;
  surgeryDetails?: string | null;
  chronicConditions?: string[] | null;
  otherHealthConditions?: string[] | null;
  pregnancy?: string | null;
  fitnessGoals?: string[] | null;
  goalTimeline?: string | null;
  specificGoals?: string | null;
  pilatesExperience?: boolean | null;
  pilatesDuration?: string | null;
  studioFrequency?: string | null;
  sessionPreference?: string | null;
  apparatusPreference?: string[] | null;
  customApparatus?: string | null;
  motivation?: string[] | null;
  otherMotivation?: string[] | null;
  progressTracking?: string[] | null;
  otherProgressTracking?: string[] | null;
}

export interface NewOnboarding {
  id?: string;
  userId: string;
  step: string;
  completedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  name?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  gender?: string | null;
  fitnessLevel?: string | null;
  exercises?: string[] | null;
  otherExercises?: string[] | null;
  exerciseFrequency?: string | null;
  sessionLength?: string | null;
  injuries?: boolean | null;
  injuriesDetails?: string | null;
  recentSurgery?: boolean | null;
  surgeryDetails?: string | null;
  chronicConditions?: string[] | null;
  otherHealthConditions?: string[] | null;
  pregnancy?: string | null;
  fitnessGoals?: string[] | null;
  goalTimeline?: string | null;
  specificGoals?: string | null;
  pilatesExperience?: boolean | null;
  pilatesDuration?: string | null;
  studioFrequency?: string | null;
  sessionPreference?: string | null;
  apparatusPreference?: string[] | null;
  customApparatus?: string | null;
  motivation?: string[] | null;
  otherMotivation?: string[] | null;
  progressTracking?: string[] | null;
  otherProgressTracking?: string[] | null;
}

export interface PersonalTrainerInteraction {
  id: string;
  userId: string;
  interactionType: string;
  content: string;
  createdAt: Date;
}

export interface NewPersonalTrainerInteraction {
  id?: string;
  userId: string;
  interactionType: string;
  content: string;
  createdAt?: Date;
} 