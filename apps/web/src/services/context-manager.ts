// Web App Adapter for Context Manager Service - Types and interfaces for client-side use
import type { UserContext, CompletedWorkout } from "@essentials/services";

// Re-export types for use in React components
export type { UserContext, CompletedWorkout };

// These functions would be implemented via tRPC calls
// The actual business logic is in @essentials/services and executed on the API side

export async function buildUserContext(
  userId: string,
  timeRange?: { start: Date; end: Date }
): Promise<UserContext> {
  // This would be implemented via tRPC call to the API
  throw new Error("This function should be called through tRPC on the web client");
}

export async function getContextForInteraction(
  userId: string,
  interactionType: "workout_feedback" | "progress_check" | "goal_setting" | "general"
): Promise<Partial<UserContext>> {
  // This would be implemented via tRPC call to the API
  throw new Error("This function should be called through tRPC on the web client");
}
