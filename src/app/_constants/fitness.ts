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

export const FITNESS_LEVEL = ["Beginner", "Intermediate", "Advanced"] as const;
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
