export const GOALS = [
  "Lose weight",
  "Gain muscle",
  "Improve flexibility",
  "Improve balance",
  "Improve posture",
  "Improve sleep",
  "Reduce stress",
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
