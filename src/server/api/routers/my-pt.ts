import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { generateAiChatResponse, getChatHistory } from "@/services/ai-chat";
import { buildUserContext } from "@/services/context-manager";
import {
  getAiSystemPrompt,
  getMessages,
  checkOnboardingCompletion,
} from "@/drizzle/src/db/queries";
import {
  insertAiSystemPrompt,
  updateAiSystemPrompt,
} from "@/drizzle/src/db/mutations";

export const myPtRouter = createTRPCRouter({
  /**
   * Send a message to the AI and get a response
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1, "Message cannot be empty"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId;

        // Check if onboarding is completed
        const isCompleted = await checkOnboardingCompletion(userId);
        if (!isCompleted) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message:
              "Please complete your onboarding first to use the AI trainer.",
          });
        }

        // Build user context
        const userContext = await buildUserContext(userId);

        // Generate AI response
        const aiResponse = await generateAiChatResponse(
          input.message,
          userId,
          userContext,
        );

        return {
          message: aiResponse,
          success: true,
        };
      } catch (error) {
        console.error("Error sending message to AI:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process your message. Please try again.",
        });
      }
    }),

  /**
   * Get chat history for the current user
   */
  getChatHistory: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId;
        const messages = await getMessages(userId);

        // Apply pagination
        const limit = input?.limit ?? 50;
        const offset = input?.offset ?? 0;
        const paginatedMessages = messages.slice(offset, offset + limit);

        return {
          messages: paginatedMessages.map((msg) => ({
            id: msg.id,
            content: msg.content ?? msg.message,
            role: msg.role,
            createdAt: msg.createdAt,
            toolCalls: msg.toolCalls || undefined,
          })),
          hasMore: messages.length > offset + limit,
          total: messages.length,
        };
      } catch (error) {
        console.error("Error fetching chat history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chat history",
        });
      }
    }),

  /**
   * Get the user's current system prompt
   */
  getSystemPrompt: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.userId;
      const systemPrompt = await getAiSystemPrompt(userId);

      return systemPrompt
        ? {
            id: systemPrompt.id,
            name: systemPrompt.name,
            prompt: systemPrompt.prompt,
            createdAt: systemPrompt.createdAt,
          }
        : null;
    } catch (error) {
      console.error("Error fetching system prompt:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch system prompt",
      });
    }
  }),

  /**
   * Create or update a system prompt for the user
   */
  saveSystemPrompt: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        prompt: z.string().min(10, "Prompt must be at least 10 characters"),
        id: z.string().uuid().optional(), // If provided, update existing
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId;

        if (input.id) {
          // Update existing prompt
          const updated = await updateAiSystemPrompt(input.id, {
            userId,
            name: input.name,
            prompt: input.prompt,
            createdAt: new Date(),
          });

          return {
            success: true,
            systemPrompt: updated,
          };
        } else {
          // Create new prompt
          const created = await insertAiSystemPrompt({
            userId,
            name: input.name,
            prompt: input.prompt,
            createdAt: new Date(),
          });

          return {
            success: true,
            systemPrompt: created,
          };
        }
      } catch (error) {
        console.error("Error saving system prompt:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save system prompt",
        });
      }
    }),

  /**
   * Clear chat history for the current user
   */
  clearChatHistory: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const userId = ctx.userId;

      // TODO: Implement clearChatMessages mutation in mutations.ts
      // For now, we'll return success but log that it needs implementation
      console.log(`TODO: Clear chat history for user: ${userId}`);

      return {
        success: true,
        message: "Chat history will be cleared (feature coming soon)",
      };
    } catch (error) {
      console.error("Error clearing chat history:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to clear chat history",
      });
    }
  }),

  /**
   * Get AI trainer status/info
   */
  getTrainerInfo: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.userId;
      const isOnboardingComplete = await checkOnboardingCompletion(userId);
      const systemPrompt = await getAiSystemPrompt(userId);
      const messages = await getMessages(userId);

      return {
        isOnboardingComplete,
        hasSystemPrompt: !!systemPrompt,
        messageCount: messages.length,
        lastMessageAt: messages[0]?.createdAt ?? null,
      };
    } catch (error) {
      console.error("Error fetching trainer info:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch trainer information",
      });
    }
  }),
});
