// AI Chat Service - Core business logic for AI interactions
import type { UserContext } from "./context-manager";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI();

export interface ChatMessage {
  role: "user" | "assistant" | "developer";
  content: string;
}

interface ChatServiceDependencies {
  getMessages: (userId: string) => Promise<Array<{
    role: string;
    content: string | null;
    message: string | null;
  }>>;
  getAiSystemPrompt: (userId: string) => Promise<{
    prompt: string;
    name: string;
  } | null>;
  insertAiChatMessages: (data: {
    userId: string;
    message: string;
    content: string;
    role: string;
  }) => Promise<void>;
}

/**
 * AI Chat Service - handles all AI chat interactions
 */
export class AiChatService {
  constructor(private deps: ChatServiceDependencies) {}

  /**
   * Generates an AI chat response based on user input, context, and chat history
   */
  async generateResponse(
    userInput: string,
    userId: string,
    userContext: UserContext
  ): Promise<string> {
    // Fetch user's system prompt
    const systemPrompt = await this.deps.getAiSystemPrompt(userId);

    // Fetch chat history
    const chatHistory = await this.deps.getMessages(userId);

    // Build the full system context including user context
    const fullSystemContext = this.buildSystemContext(
      systemPrompt?.prompt ?? "",
      systemPrompt?.name ?? "",
      userContext
    );

    // Convert chat history to OpenAI format (in chronological order)
    const conversationHistory = chatHistory
      .reverse() // Reverse since getMessages returns in desc order
      .map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content ?? msg.message ?? "",
      })) as Array<{ role: "user" | "assistant"; content: string }>;

    // Add the current user input
    const currentInput = { role: "user" as const, content: userInput };

    try {
      const response = await openai.responses.create({
        model: "gpt-4.1-2025-04-14",
        instructions: fullSystemContext,
        input: [...conversationHistory, currentInput] as Array<{
          role: "user" | "assistant";
          content: string;
        }>,
        max_output_tokens: 500,
      });

      const aiResponse =
        response.output_text ??
        "I apologize, but I couldn't generate a response. Please try again.";

      // Save both user message and AI response to database
      await Promise.all([
        this.deps.insertAiChatMessages({
          userId,
          message: userInput,
          content: userInput,
          role: "user",
        }),
        this.deps.insertAiChatMessages({
          userId,
          message: aiResponse,
          content: aiResponse,
          role: "assistant",
        }),
      ]);

      return aiResponse;
    } catch (error) {
      console.error("Error generating AI chat response:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  /**
   * Fetches chat history for a user
   */
  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    const messages = await this.deps.getMessages(userId);

    return messages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "developer",
      content: msg.content ?? msg.message ?? "",
    }));
  }

  /**
   * Builds the full system context including user context and system prompt
   */
  private buildSystemContext(
    systemPrompt: string,
    trainerName: string,
    userContext: UserContext
  ): string {
    const defaultPrompt =
      "You are a helpful personal trainer AI assistant. Provide personalized fitness advice and support based on the user's profile and goals.";

    const userContextText = this.formatUserContextForAI(userContext);
    const name = trainerName ?? "AI Trainer";

    const basePrompt = systemPrompt ?? defaultPrompt;

    return `You are ${name}, a personal trainer AI assistant. 
    
Here is how the user would like you to behave:
${basePrompt}

USER CONTEXT:
${userContextText}

Please use this context to provide personalized and relevant responses to the user's questions and requests. Remember to embody the personality and approach described in your system prompt while staying true to your role as ${name}.

Your answers should not be very long, they should be about 5 sentences maximum. They should be concise and the length of a normal text message.`;
  }

  /**
   * Formats user context into a readable text format for the AI
   */
  private formatUserContextForAI(context: UserContext): string {
    return `
PROFILE:
- Name: ${context.profile.name ?? "Not specified"}
- Age: ${context.profile.age ?? "Not specified"}
- Height: ${context.profile.height ?? "Not specified"} cm
- Weight: ${context.profile.weight ?? "Not specified"} kg
- Gender: ${context.profile.gender ?? "Not specified"}
- Fitness Level: ${context.profile.fitnessLevel ?? "Not specified"}
- Goals: ${context.profile.fitnessGoals?.join(", ") ?? "Not specified"}
- Workout Frequency: ${context.profile.exerciseFrequency ?? "Not specified"}
- Session Length: ${context.profile.sessionLength ?? "Not specified"}
- Exercises: ${context.profile.exercises?.join(", ") ?? "Not specified"}
- Custom Exercises: ${context.profile.otherExercises?.join(", ") ?? "Not specified"}

PILATES EXPERIENCE:
- Has Experience: ${context.profile.pilatesExperience ? "Yes" : "No"}
- Studio Frequency: ${context.profile.studioFrequency ?? "Not specified"}
- Session Preference: ${context.profile.sessionPreference ?? "Not specified"}
- Apparatus Preference: ${context.profile.apparatusPreference?.join(", ") ?? "Not specified"}

HEALTH INFORMATION:
- Injuries: ${context.profile.health.injuries ? `Yes - ${context.profile.health.injuriesDetails}` : "No injuries reported"}
- Chronic Conditions: ${context.profile.health.chronicConditions?.join(", ") ?? "None"}
- Pregnancy: ${context.profile.health.pregnancy ?? "Not specified"}

RECENT ACTIVITY:
- Total Workouts (Last 30 days): ${context.recentActivity.recentWorkouts.length}
- Weekly Average: ${context.recentActivity.consistency.weeklyAverage} workouts
- Monthly Average: ${context.recentActivity.consistency.monthlyAverage} workouts
- Current Streak: ${context.recentActivity.consistency.streak} days

RECENTLY COMPLETED WORKOUTS:
${
  context.recentActivity.recentWorkouts.length > 0
    ? context.recentActivity.recentWorkouts
        .slice(-5) // Last 5 workouts
        .map(
          (workout) =>
            `- ${workout.workout?.name ?? "Unnamed"} (${workout.workout?.activityType ?? "Unknown"}) - ${workout.workoutTracking.durationHours}h ${workout.workoutTracking.durationMinutes}m - Intensity: ${workout.workoutTracking.intensity}/10 - Would do again: ${workout.workoutTracking.wouldDoAgain ? "Yes" : "No"}`
        )
        .join("\n")
    : "- No recent workouts recorded"
}

CURRENT WORKOUT PLAN:
${
  context.workoutPlan.plannedWorkouts.length > 0
    ? context.workoutPlan.plannedWorkouts
        .map(
          (workout, index) =>
            `- Workout ${index + 1}: ${workout.name}
             - Description: ${workout.description ?? "No description"}
             - Activity Type: ${workout.activityType ?? "Not specified"}
             - Duration: ${workout.duration ?? "Not specified"}
             - Level: ${workout.level ?? "Not specified"}
             - Has it been booked: ${workout.isBooked ? "Yes" : "No"}
             - Other Notes: ${workout.status ?? "None"}`
        )
        .join("\n")
    : "- No planned workouts"
}

PROGRESS & CHALLENGES:
- Current Challenges: ${context.progress.challenges?.join(", ") ?? "Not specified"}
- Recent Improvements: ${context.progress.improvements?.join(", ") ?? "Not specified"}

MOTIVATION:
- Motivation Factors: ${context.profile.motivation?.join(", ") ?? "Not specified"}
- Other Motivations: ${context.profile.otherMotivation?.join(", ") ?? "Not specified"}
- Progress Tracking Methods: ${context.profile.progressTracking?.join(", ") ?? "Not specified"}
`;
  }
}

// Convenience functions for backward compatibility and direct usage
export async function generateAiChatResponse(
  userInput: string,
  userId: string,
  userContext: UserContext,
  deps: ChatServiceDependencies
): Promise<string> {
  const service = new AiChatService(deps);
  return service.generateResponse(userInput, userId, userContext);
}

export async function getChatHistory(
  userId: string,
  deps: ChatServiceDependencies
): Promise<ChatMessage[]> {
  const service = new AiChatService(deps);
  return service.getChatHistory(userId);
}
