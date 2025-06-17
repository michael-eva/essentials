export const GENDER = ["Male", "Female", "Prefer not to say"] as const;

export type Gender = (typeof GENDER)[number];
