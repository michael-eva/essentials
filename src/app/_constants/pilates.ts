export const PILATES_DURATION = [
  "Less than 3 months",
  "3-6 months",
  "6-12 months",
  "1-3 years",
  "More than 3 years",
] as const;

export const PILATES_SESSIONS = [
  "0 time per week",
  "1 time per week",
  "2 - 3 times per week",
  "3 - 4 times per week",
  "4+ times per week",
  "1 - 2 times per month",
] as const;

// export const PILATES_APPARATUS = [
//   "None",
//   "Mat",
//   "Barre",
//   "Reformer",
//   "Hot Mat",
//   "Classical",
//   "Clinical",
//   "Other",
// ];

export const PILATES_APPARATUS = [
  "None",
  "Ankle weights",
  "Ball",
  "Weights",
  "Sliders",
  "Resistance bands",
  "Chair",
  "Foam Roller",
  "Blocks",
] as const;

export const PILATES_SESSION_PREFERENCE = [
  "Online",
  "At Home",
  "Private sessions",
  "Group classes",
  "No preference",
] as const;

export const PILATES_STYLES = [
  "Pilates",
  "Barre",
  "Strength",
  "HIIT",
  "Yoga",
  "Stretching",
] as const;

export type PilatesDuration = (typeof PILATES_DURATION)[number];
export type PilatesSessions = (typeof PILATES_SESSIONS)[number];
export type PilatesApparatus = (typeof PILATES_APPARATUS)[number];
export type CustomPilateApparatus = (typeof PILATES_APPARATUS)[number];
export type PilatesSessionPreference =
  (typeof PILATES_SESSION_PREFERENCE)[number];
