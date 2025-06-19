// API Adapter for Personal Trainer Service
import {
  PersonalTrainerService,
  generateAIResponse as generateAIResponseShared,
  type GeneratedWorkoutPlanResponse
} from "@essentials/services";
import type { UserContext } from "@essentials/services";
import { nonPilates, pilatesClasses } from "../data";

// Create available classes object
const availableClasses = {
  pilates: pilatesClasses,
  nonPilates: nonPilates,
};

// Create service instance
const personalTrainerService = new PersonalTrainerService(availableClasses);

// Export adapted functions
export async function generateAIResponse(
  userInput: string,
  context: UserContext
): Promise<GeneratedWorkoutPlanResponse> {
  return personalTrainerService.generateWorkoutPlan(userInput, context);
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
  return personalTrainerService.analyzeProgress(userId, timeRange);
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
  return personalTrainerService.generateFollowUpQuestions(userId, context);
}

export async function updateUserProfile(
  userId: string,
  interaction: any
): Promise<{
  updatedPreferences: Record<string, string>;
  newGoals: string[];
  removedGoals: string[];
}> {
  return personalTrainerService.updateUserProfile(userId, interaction);
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
  return personalTrainerService.generateProgressReport(userId, timeRange);
}

// Re-export types
export type { GeneratedWorkoutPlanResponse };

// Backward compatibility
export { generateAIResponseShared };
