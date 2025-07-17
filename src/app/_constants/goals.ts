export const GOALS = [
  "Lose weight",
  "Increase strength",
  "Improve flexibility",
  "Get toned",
  "Improve sleep",
  "Reduce stress",
  "Increase endurance",
  "Prenatal/postnatal fitness",
  "Other",
];

export const GOAL_TIMELINE = [
  "Ongoing",
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "More than a year",
] as const;

export type Goal = (typeof GOALS)[number];
export type GoalTimeline = (typeof GOAL_TIMELINE)[number];
