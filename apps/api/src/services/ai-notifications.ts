// API Adapter for AI Notifications Service
import {
  AiNotificationsService,
  generateAiNotification as generateAiNotificationShared
} from "@essentials/services";
import { getAiSystemPrompt } from "../drizzle/src/db/queries";
import { insertAiChatMessages } from "../drizzle/src/db/mutations";
import type { UserContext } from "@essentials/services";

// Create dependencies object for the shared service
const notificationServiceDeps = {
  getAiSystemPrompt,
  insertAiChatMessages,
};

// Create service instance
const aiNotificationsService = new AiNotificationsService(notificationServiceDeps);

// Export adapted functions
export async function generateAiNotification(
  userId: string,
  userContext: UserContext
): Promise<string> {
  return aiNotificationsService.generateNotification(userId, userContext);
}

// Backward compatibility
export { generateAiNotificationShared };
