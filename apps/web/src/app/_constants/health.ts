export const HEALTH_CONDITIONS = [
  "Back pain",
  "Neck pain",
  "Arthritis",
  "Osteoporosis",
  "Hypertension",
  "Diabetes",
  "Heart condition",
  "Respiratory condition",
  "Asthma",
  "None",
  "Other",
];
export const PREGNANCY_OPTIONS = [
  "Not applicable",
  "Pregnant",
  "Postpartum (0-6 months)",
  "Postpartum (6-12 months)",
] as const;
export type PregnancyOption = (typeof PREGNANCY_OPTIONS)[number];
export type HealthCondition = (typeof HEALTH_CONDITIONS)[number];
