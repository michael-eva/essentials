// Web App Adapter for Personal Trainer Service - Types and interfaces for client-side use
import type { GeneratedWorkoutPlanResponse, UserContext } from "@essentials/services";

// Re-export types for use in React components
export type { GeneratedWorkoutPlanResponse, UserContext };

// These functions would be implemented via tRPC calls
// The actual business logic is in @essentials/services and executed on the API side

export async function generateAIResponse(
  userInput: string,
  context: UserContext
): Promise<GeneratedWorkoutPlanResponse> {
  // This would be implemented via tRPC call to the API
  throw new Error("This function should be called through tRPC on the web client");
}

export async function analyzeProgress(
  userId: string,
  timeRange: { start: Date; end: Date }
): Promise<{
  progressMetrics: {
    consistency: number;
    goalProgress: Record<string, number>;
    improvements: string[];
    challenges: string[];
  };
  recommendations: {
    workoutAdjustments: string[];
    focusAreas: string[];
    nextSteps: string[];
  };
}> {
  // This would be implemented via tRPC call to the API
  throw new Error("This function should be called through tRPC on the web client");
}

export async function generateFollowUpQuestions(
  userId: string,
  context: {
    lastInteraction: any;
    recentWorkouts: any[];
    currentGoals: string[];
  }
): Promise<
  {
    questions: string[];
    purpose: "progress_check" | "goal_adjustment" | "motivation" | "feedback";
    priority: "high" | "medium" | "low";
  }[]
> {
  // This would be implemented via tRPC call to the API
  throw new Error("This function should be called through tRPC on the web client");
}

export async function updateUserProfile(
  userId: string,
  interaction: any
): Promise<{
  updatedPreferences: Record<string, string>;
  newGoals: string[];
  removedGoals: string[];
}> {
  // This would be implemented via tRPC call to the API
  throw new Error("This function should be called through tRPC on the web client");
}

export async function generateProgressReport(
  userId: string,
  timeRange: { start: Date; end: Date }
): Promise<{
  summary: string;
  achievements: string[];
  challenges: string[];
  recommendations: {
    shortTerm: string[];
    longTerm: string[];
  };
  nextSteps: string[];
}> {
  // This would be implemented via tRPC call to the API
  throw new Error("This function should be called through tRPC on the web client");
}
