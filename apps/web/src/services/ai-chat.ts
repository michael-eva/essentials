// Web App Adapter for AI Chat Service - Uses tRPC instead of direct DB access
import type { ChatMessage, UserContext } from "@essentials/services";

// Note: In the web app, these services are called through tRPC
// This file provides the interface but the actual implementation
// is on the API side through tRPC procedures

export type { ChatMessage, UserContext };

// These functions would be implemented via tRPC calls
// Example: trpc.aiChat.generateResponse.mutate({ userInput, userId, userContext })

export async function generateAiChatResponse(
  userInput: string,
  userId: string,
  userContext: UserContext
): Promise<string> {
  // This would be implemented via tRPC call to the API
  throw new Error("This function should be called through tRPC on the web client");
}

export async function getChatHistory(userId: string): Promise<ChatMessage[]> {
  // This would be implemented via tRPC call to the API
  throw new Error("This function should be called through tRPC on the web client");
}

// Re-export the types for use in React components
export type {
  CompletedWorkout,
  GeneratedWorkoutPlanResponse,
  ProgressMetrics,
} from "@essentials/services";
