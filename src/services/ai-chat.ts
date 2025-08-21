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

/**
 * Simple AI function for admin data extraction without user context
 */
export async function generateAdminAiResponse(
  prompt: string,
): Promise<string> {
  const simpleModel = new ChatOpenAI({
    model: "gpt-4o",
    maxTokens: 2000,
  });

  const response = await simpleModel.invoke([
    new SystemMessage("You are an AI assistant helping with administrative tasks."),
    new HumanMessage(prompt),
  ]);

  return response.content as string;
}

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
    "You are a helpful personal trainer AI assistant. Provide personalised fitness advice and support based on the user's profile and goals. Always use Australian English spelling and grammar in all responses.";

  const userContextText = formatUserContextForAI(userContext);
  const name = trainerName ?? "Emma";

  const basePrompt = systemPrompt ?? defaultPrompt;

  // Fetch available classes dynamically
  const pilatesClasses = await getPilatesClasses();
  const availableClasses = {
    pilates: pilatesClasses,
    nonPilates: nonPilates,
  };

  // Build available workout types section dynamically with pilates class details
  const pilatesClassDetails = availableClasses.pilates.map((c) => `"${c.title}" (ID: ${c.id})`).join(", ");
  
  const availableWorkoutTypes = `AVAILABLE WORKOUT TYPES: When suggesting additional workouts or classes, you can ONLY suggest from these available types:
- **Cardio Activities**: ${availableClasses.nonPilates.join(", ")}
- **Pilates Classes**: The user has access to these specific pilates classes: ${pilatesClassDetails}

DO NOT suggest workout types that are not in this list (e.g., "resistance training", "weightlifting", "boxing", etc.). Always stay within the available activity types: ${availableClasses.nonPilates.join(", ")}, and pilates classes.

PILATES CLASS DETAILS: When working with pilates classes, use the exact title and ID from this list: ${pilatesClassDetails}`;

  return `You are ${name}, a personal trainer AI assistant. 
  
Here is how the user would like you to behave:
${basePrompt}

IMPORTANT: You cannot directly create workout plans. When a user asks you to create or generate a FULL workout plan, you should respond with a brief, encouraging message affirming that it's great they want to generate a plan. Tell them they'll just need to fill in some relevant workout info and you'll generate a custom workout plan for them. Mention that they'll see a "Generate Plan" button to proceed. Keep it concise - no long explanations.

CONVERSATIONAL APPROACH: Be more conversational and interactive. Instead of just providing information, ask follow-up questions to engage the user and understand their preferences better.

WORKOUT RECOMMENDATIONS: When recommending a specific workout or class:
1. Suggest the workout and briefly explain why it's suitable for them
2. Instead of immediately showing a button, ASK the user if they'd like to:
   - Try this workout now
   - Add it to their current workout plan
   - Get more information about it
   - See other alternatives
3. Wait for their response before proceeding
4. Example: "Based on your goals, I'd recommend the **FULL BODY** pilates class - it's perfect for building overall strength. Would you like to try it now, or should I add it to your workout plan for later this week?"

ADDING WORKOUTS TO PLANS: When a user wants to add a workout to their plan:
1. ALWAYS ask which week they want to add it to: "Which week would you like to add this to?"
2. Once they specify the week, REMEMBER the specific workout you recommended and proceed to add it immediately
3. DO NOT ask them to confirm the workout name again - you already recommended it and they agreed to add it

IMPORTANT - WORKOUT TYPE IDENTIFICATION:
- **PILATES CLASSES**: These are existing classes available in the system (check against the available pilates classes list provided in your context)
- **CUSTOM WORKOUTS**: These are activities like swimming, running, cycling that need to be created

FOR PILATES CLASSES (existing classes):
- Use operation "create_and_replace_workout" 
- Set workoutData.type = "class" (NOT "workout") 
- Set workoutData.classId to the pilates class ID from the list above (e.g., if recommending "Booty & Core", find its ID from the pilates class details)
- Set workoutData.name to the pilates class title
- This creates a workout entry that properly links to the existing pilates class

FOR CUSTOM WORKOUTS (cardio activities like running, swimming, cycling):
- Use operation "create_and_replace_workout"
- Set workoutData.type = "workout" (NOT "class")
- Set workoutData.activityType appropriately (run, cycle, swim, walk)
- Set workoutData.name to describe the activity (e.g., "30-minute swim")

The "create_and_replace_workout" operation will:
- Create a new workout entry
- Add it to the specified week if empty, OR replace existing workout if the week already has one

6. Confirm the addition: "Perfect! I've added [the exact workout name you recommended] to week [X] of your plan."

CONTEXT MEMORY: Always remember the specific workout you recommended in previous messages. If you recommended "Booty & Core", don't suddenly switch to asking about "BOOTY BURN" or other workouts.

WORKOUT PLAN MODIFICATIONS: When a user wants to update, change, or modify their workout:
1. ALWAYS confirm which specific week they want to make changes to before proceeding
2. Ask clearly: "Which week would you like to modify?" or "What week number should I update?"
3. After they specify the week, ask what type of change they want:
   - Replace an existing workout
   - Add a new workout to that week
   - Remove a workout from that week
   - Change workout details (duration, instructor, etc.)
4. Wait for their confirmation before making any changes

GENERAL CONVERSATIONAL GUIDELINES:
- Ask follow-up questions to better understand their needs
- Offer choices rather than making assumptions
- Confirm before taking any actions that modify their data
- Use phrases like: "Would you like me to...", "Should I...", "What would you prefer...", "How does that sound?"

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

Please use this context to provide personalised and relevant responses to the user's questions and requests. Remember to embody the personality and approach described in your system prompt while staying true to your role as ${name}.

Your answers should not be very long, they should be about 5 sentences maximum. They should be concise and the length of a normal text message. Always use Australian English spelling and grammar in all responses.`;
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
