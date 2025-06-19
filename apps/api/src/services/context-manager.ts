// API Adapter for Context Manager Service
import {
  ContextManagerService,
  buildUserContext as buildUserContextShared,
  getContextForInteraction as getContextForInteractionShared,
  type UserContext,
  type CompletedWorkout
} from "@essentials/services";
import {
  getWorkoutTracking,
  getOnboardingData,
  getActivePlan,
  getWorkoutById,
} from "../drizzle/src/db/queries";

// Create dependencies object for the shared service
const contextServiceDeps = {
  getOnboardingData,
  getWorkoutTracking,
  getActivePlan,
  getWorkoutById,
};

// Create service instance
const contextManagerService = new ContextManagerService(contextServiceDeps);

// Export adapted functions
export async function buildUserContext(
  userId: string,
  timeRange: { start: Date; end: Date } = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date(),
  }
): Promise<UserContext> {
  return contextManagerService.buildUserContext(userId, timeRange);
}

export async function getContextForInteraction(
  userId: string,
  interactionType: "workout_feedback" | "progress_check" | "goal_setting" | "general"
): Promise<Partial<UserContext>> {
  return contextManagerService.getContextForInteraction(userId, interactionType);
}

// Re-export types
export type { UserContext, CompletedWorkout };

// Backward compatibility
export { buildUserContextShared, getContextForInteractionShared };
