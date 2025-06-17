export const MOTIVATION_FACTORS = [
  "Health benefits",
  "Stress relief",
  "Social aspects",
  "Weight management",
  "Athletic performance",
  "Mental wellbeing",
  "Appearance",
  "Doctor's recommendation",
  "Other",
];
export const PROGRESS_TRACKING_METHODS = [
  "Body measurements",
  "Progress photos",
  "Strength gains",
  "Flexibility improvements",
  "Endurance tracking",
  "Habit tracking",
  "Journaling",
  "Other",
];
export type MotivationFactor = (typeof MOTIVATION_FACTORS)[number];
export type ProgressTrackingMethod = (typeof PROGRESS_TRACKING_METHODS)[number];
