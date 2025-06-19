// Main exports for @essentials/services package
export * from "./ai-chat";
export * from "./ai-notifications";
export * from "./context-manager";
export * from "./personal-trainer";
export * from "./progress-tracker";

// Re-export types for convenience
export type {
  UserContext,
  CompletedWorkout,
} from "./context-manager";

export type {
  ChatMessage,
} from "./ai-chat";

export type {
  GeneratedWorkoutPlanResponse,
} from "./personal-trainer";

export type {
  ProgressMetrics,
} from "./progress-tracker";
