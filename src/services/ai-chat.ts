import type { UserContext } from "./context-manager";
import { getMessages, getAiSystemPrompt } from "@/drizzle/src/db/queries";
import { insertAiChatMessages } from "@/drizzle/src/db/mutations";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
  manageWorkoutPlanTool,
  // editWorkoutPlanTool
} from "./ai-chat-tools";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { formatUserContextForAI } from "./context-formatter";
import { getPilatesClasses } from "@/drizzle/src/db/queries";
import { nonPilates } from "@/data";

const model = new ChatOpenAI({
  model: "gpt-4o",
  maxTokens: 2000,
});

const agent = createReactAgent({
  llm: model,
  tools: [
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
  const fullSystemContext = await buildSystemContext(
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
async function buildSystemContext(
  systemPrompt: string,
  trainerName: string,
  userContext: UserContext,
): Promise<string> {
  const defaultPrompt =
    "You are a helpful personal trainer AI assistant. Provide personalized fitness advice and support based on the user's profile and goals.";

  const userContextText = formatUserContextForAI(userContext);
  const name = trainerName ?? "Emma";

  const basePrompt = systemPrompt ?? defaultPrompt;

  // Fetch available classes dynamically
  const pilatesClasses = await getPilatesClasses();
  const availableClasses = {
    pilates: pilatesClasses,
    nonPilates: nonPilates,
  };

  // Build available workout types section dynamically
  const availableWorkoutTypes = `AVAILABLE WORKOUT TYPES: When suggesting additional workouts or classes, you can ONLY suggest from these available types:
- **Cardio Activities**: ${availableClasses.nonPilates.join(", ")}
- **Pilates Classes**: The user has access to various pilates classes: ${availableClasses.pilates.map((c) => c.title).join(", ")}

DO NOT suggest workout types that are not in this list (e.g., "resistance training", "weightlifting", "boxing", etc.). Always stay within the available activity types: ${availableClasses.nonPilates.join(", ")}, and pilates classes.`;

  return `You are ${name}, a personal trainer AI assistant. 
  
Here is how the user would like you to behave:
${basePrompt}

IMPORTANT: You cannot directly create workout plans. When a user asks you to create or generate a FULL workout plan, you should respond with a brief, encouraging message affirming that it's great they want to generate a plan. Tell them they'll just need to fill in some relevant workout info and you'll generate a custom workout plan for them. Mention that they'll see a "Generate Plan" button to proceed. Keep it concise - no long explanations.

EXERCISE SUGGESTIONS: When users ask for exercise suggestions, specific workouts, or recommendations for individual activities (like "swimming exercises" or "give me a workout"), provide helpful suggestions directly. Only redirect to plan generation when they specifically ask for a complete workout plan or schedule.

WORKOUT MODIFICATION CONFIRMATION: When a user wants to update, change, or modify a workout, ALWAYS confirm which specific week they want to make changes to before proceeding. Ask clearly: "Which week would you like to modify?" or "What week number should I update?" This prevents mistakes and ensures you're making changes to the correct week in their plan.

${availableWorkoutTypes}

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
