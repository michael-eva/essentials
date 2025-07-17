export const DEFAULT_EXERCISE_OPTIONS = [
  "Running",
  "Cycling",
  "Swimming",
  "Weightlifting",
  "Dance",
  "Team sports",
  "Pilates",
  "Walking",
  "Bodyweight",
  "Resistance",
  "Other",
];

export const FITNESS_LEVEL = [
  "I'm completely new and want to start my fitness journey",
  "I've worked out before but want to get back into it",
  "I workout regularly and want to maintain my fitness",
  "I've been working out for years and want to challenge myself",
] as const;
export const EXERCISE_FREQUENCY = ["0", "1-2", "3-4", "5+"] as const;
export const SESSION_LENGTH = [
  "Less than 15 minutes",
  "15-30 minutes",
  "30-45 minutes",
  "45-60 minutes",
  "More than 60 minutes",
] as const;

export type FitnessLevel = (typeof FITNESS_LEVEL)[number];
export type ExerciseFrequency = (typeof EXERCISE_FREQUENCY)[number];
export type SessionLength = (typeof SESSION_LENGTH)[number];
