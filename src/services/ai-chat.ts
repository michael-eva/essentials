import type { UserContext } from "./context-manager";
import { getMessages, getAiSystemPrompt } from "@/drizzle/src/db/queries";
import { insertAiChatMessages } from "@/drizzle/src/db/mutations";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
  createWorkoutPlanTool,
  manageWorkoutPlanTool,
  // editWorkoutPlanTool
} from "./ai-chat-tools";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";

const model = new ChatOpenAI({
  model: "gpt-4o",
  maxTokens: 2000,
});

const agent = createReactAgent({
  llm: model,
  tools: [
    createWorkoutPlanTool,
    manageWorkoutPlanTool,
    // editWorkoutPlanTool
  ],
});

/**
 * Generates an AI chat response based on user input, context, and chat history
 */
export async function generateAiChatResponse(
  userInput: string,
  userId: string,
  userContext: UserContext,
): Promise<string> {
  // Fetch user's system prompt
  const systemPrompt = await getAiSystemPrompt(userId);

  // Fetch chat history
  const chatHistory = await getMessages(userId);

  // Build the full system context including user context
  const fullSystemContext = buildSystemContext(
    systemPrompt?.prompt ?? "",
    systemPrompt?.name ?? "",
    userContext,
  );

  // add the user's ID to the system prompt
  const systemPromptWithUserId = `
  ${fullSystemContext ?? ""}
  We are dealing with the current user who has the user ID : ${userId}.
  `;

  // Convert chat history to OpenAI format (in chronological order)
  const conversationHistory = chatHistory
    .reverse() // Reverse since getMessages returns in desc order
    .map((msg) =>
      msg.role === "assistant"
        ? new AIMessage(msg.content ?? msg.message ?? "")
        : new HumanMessage(msg.content ?? msg.message ?? ""),
    );

  // add the system prompt to the conversation history
  conversationHistory.unshift(new SystemMessage(systemPromptWithUserId));

  // Add the current user input
  const currentInput = new HumanMessage(userInput);

  try {
    const response = await agent.invoke({
      messages: [...conversationHistory, currentInput],
    });

    console.log("🚀 ~ generateAiChatResponse ~ response:", response.messages);

    const aiResponse =
      response.messages?.[response.messages.length - 1]?.content;
    const aiResponseString =
      typeof aiResponse === "string"
        ? aiResponse
        : "I apologize, but I couldn't generate a response. Please try again.";

    // Extract tool calls and tool responses
    let toolCalls: any[] = [];
    const toolResponses: any[] = [];

    for (const message of response.messages || []) {
      if (message.constructor.name === "AIMessage") {
        const aiMsg = message as any;
        if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
          toolCalls = aiMsg.tool_calls;
        }
      } else if (message.constructor.name === "ToolMessage") {
        const toolMsg = message as any;
        toolResponses.push({
          tool_call_id: toolMsg.tool_call_id,
          content: toolMsg.content,
          name: toolMsg.name,
        });
      }
    }

    // Combine tool calls with their responses
    const enhancedToolCalls = toolCalls.map((toolCall) => ({
      ...toolCall,
      response:
        toolResponses.find((resp) => resp.tool_call_id === toolCall.id) || null,
    }));

    console.log("🔧 Enhanced tool calls:", enhancedToolCalls);

    // Save user message first, then assistant message to ensure correct chronological order
    await insertAiChatMessages({
      userId,
      message: userInput,
      content: userInput,
      role: "user",
    });

    await insertAiChatMessages({
      userId,
      message: aiResponseString,
      content: aiResponseString,
      role: "assistant",
      toolCalls: enhancedToolCalls.length > 0 ? enhancedToolCalls : undefined,
    });

    return aiResponseString;
  } catch (error) {
    console.error("Error generating AI chat response:", error);
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Builds the full system context including user context and system prompt
 */
function buildSystemContext(
  systemPrompt: string,
  trainerName: string,
  userContext: UserContext,
): string {
  const defaultPrompt =
    "You are a helpful personal trainer AI assistant. Provide personalized fitness advice and support based on the user's profile and goals.";

  const userContextText = formatUserContextForAI(userContext);
  const name = trainerName ?? "AI Trainer";

  const basePrompt = systemPrompt ?? defaultPrompt;

  return `You are ${name}, a personal trainer AI assistant. 
  
Here is how the user would like you to behave:
${basePrompt}

WORKOUT PLAN SCHEMA RELATIONSHIPS:
Understanding the database structure is crucial for managing workout plans correctly:

1. WORKOUT_PLAN: The main plan entity
   - Contains plan metadata (name, weeks, start date, etc.)
   - One plan can have multiple weekly schedules
   - Plans belong to a specific user

2. WEEKLY_SCHEDULE: The junction table that connects plans to workouts
   - Links workout_plan.id to workout.id
   - Specifies which workout appears in which week (weekNumber)
   - One plan can have multiple weekly schedules
   - One workout can appear in multiple weeks or plans

3. WORKOUT: Individual workout entities
   - Contains workout details (name, instructor, duration, description, level, etc.)
   - Can be referenced by multiple weekly schedules
   - Workouts belong to a specific user

KEY RELATIONSHIPS:
- workout_plan (1) ←→ (many) weekly_schedule
- weekly_schedule (many) ←→ (1) workout
- When updating plans, you can:
  * Update workout details (name, duration, instructor, etc.)
  * Update weekly schedule assignments (which workout in which week)
  * Add workouts to specific weeks
  * Remove workouts from specific weeks
  * Update plan metadata (name, weeks, etc.)

USER CONTEXT:
${userContextText}

Please use this context to provide personalized and relevant responses to the user's questions and requests. Remember to embody the personality and approach described in your system prompt while staying true to your role as ${name}.

Your answers should not be very long, they should be about 5 sentences maximum. They should be concise and the length of a normal text message.`;
}

/**
 * Formats user context into a readable text format for the AI
 */
function formatUserContextForAI(context: UserContext): string {
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
            `- ${workout.workout?.name ?? "Unnamed"} (${workout.workout?.activityType ?? "Unknown"}) - ${workout.workoutTracking.durationHours}h ${workout.workoutTracking.durationMinutes}m - Intensity: ${workout.workoutTracking.intensity}/10 - Would do again: ${workout.workoutTracking.likelyToDoAgain}/10`,
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
             - Other Notes: ${workout.status ?? "None"}`,
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

/**
 * Fetches chat history for a user
 */
export async function getChatHistory(
  userId: string,
): Promise<Array<{ role: string; content: string }>> {
  const messages = await getMessages(userId);

  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content ?? msg.message ?? "",
  }));
}

/**
 * Clears chat history for a user (if needed)
 */
export async function clearChatHistory(userId: string): Promise<void> {
  // This would need a new mutation function to delete messages
  // For now, we'll just log it
  console.log(`Would clear chat history for user: ${userId}`);
  // TODO: Implement clearChatMessages mutation if needed
}
