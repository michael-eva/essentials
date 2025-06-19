// API Adapter for AI Chat Service
import { 
  AiChatService,
  generateAiChatResponse as generateAiChatResponseShared,
  getChatHistory as getChatHistoryShared,
  type ChatMessage
} from "@essentials/services";
import { getMessages, getAiSystemPrompt } from "../drizzle/src/db/queries";
import { insertAiChatMessages } from "../drizzle/src/db/mutations";
import type { UserContext } from "@essentials/services";

// Create dependencies object for the shared service
const chatServiceDeps = {
  getMessages,
  getAiSystemPrompt,
  insertAiChatMessages,
};

// Create service instance
const aiChatService = new AiChatService(chatServiceDeps);

// Export adapted functions
export async function generateAiChatResponse(
  userInput: string,
  userId: string,
  userContext: UserContext
): Promise<string> {
  return aiChatService.generateResponse(userInput, userId, userContext);
}

export async function getChatHistory(userId: string): Promise<ChatMessage[]> {
  return aiChatService.getChatHistory(userId);
}

// Backward compatibility - using the convenience functions
export { generateAiChatResponseShared, getChatHistoryShared };
