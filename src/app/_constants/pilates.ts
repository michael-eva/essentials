export const PILATES_DURATION = [
  "Less than 3 months",
  "3-6 months",
  "6-12 months",
  "1-3 years",
  "More than 3 years",
] as const;

export const PILATES_SESSIONS = [
  "1 time per week",
  "1 - 2 times per month",
  "2 - 3 times per week",
  "3 - 4 times per week",
  "4+ times per week",
] as const;

export const PILATES_APPARATUS = [
  "Mat",
  "Barre",
  "Reformer",
  "Hot Mat",
  "Classical",
  "Clinical",
  "Other",
  "None",
];

export const CUSTOM_PILATES_APPARATUS = [
  "Pilates Mat",
  "Resistance Bands",
  "Pilates Mini Ball",
  "Foam Roller",
  "Pilates Ring",
  "Light Weights",
  "Reformer",
  "None",
  "Other",
];

export const PILATES_SESSION_PREFERENCE = [
  "Online",
  "At Home",
  "Private sessions",
  "Group classes",
  "No preference",
] as const;

export type PilatesDuration = (typeof PILATES_DURATION)[number];
export type PilatesSessions = (typeof PILATES_SESSIONS)[number];
export type PilatesApparatus = (typeof PILATES_APPARATUS)[number];
export type CustomPilateApparatus = (typeof CUSTOM_PILATES_APPARATUS)[number];
export type PilatesSessionPreference =
  (typeof PILATES_SESSION_PREFERENCE)[number];
