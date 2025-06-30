export const SECTION_LABELS = {
  BASIC_QUESTION: {
    TITLE: "Personal Info",
    DESCRIPTION: "Tell us about yourself",
    COLOR: "#007AFF",
  },
  FITNESS_BG: {
    TITLE: "Fitness Background",
    DESCRIPTION: "Your exercise history",
    COLOR: "#FF9500",
  },
  GOALS: {
    TITLE: "Goals",
    DESCRIPTION: "What you want to achieve",
    COLOR: "#FF2D55",
  },
  HEALTH_CONS: {
    TITLE: "Health Considerations",
    DESCRIPTION: "Important health information",
    COLOR: "#5856D6",
  },
  MOTIVATION: {
    TITLE: "Motivation",
    DESCRIPTION: "What drives you",
    COLOR: "#FFCC00",
  },
  PILATES: {
    TITLE: "Pilates",
    DESCRIPTION: "Your Pilates experience",
    COLOR: "#34C759",
  },
  WORKOUT_TIMING: {
    TITLE: "Workout Timing",
  },
} as const;

export type SectionLabelKey = keyof typeof SECTION_LABELS;
