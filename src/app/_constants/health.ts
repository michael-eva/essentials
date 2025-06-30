export const HEALTH_CONDITIONS = [
  "None",
  "Back pain",
  "Neck pain",
  "Arthritis",
  "Osteoporosis",
  "Hypertension",
  "Diabetes",
  "Heart condition",
  "Respiratory condition",
  "Asthma",
  "Other",
];
export const PREGNANCY_OPTIONS = [
  "Not applicable",
  "First Trimester",
  "Second Trimester",
  "Third Trimester",
  "Prenatal",
  "Postnatal",
] as const;
export type PregnancyOption = (typeof PREGNANCY_OPTIONS)[number];
export type HealthCondition = (typeof HEALTH_CONDITIONS)[number];
