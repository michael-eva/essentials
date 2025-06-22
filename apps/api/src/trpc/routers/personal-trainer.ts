import { createTRPCRouter, protectedProcedure } from "@essentials/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getPersonalTrainerInteractions,
  getPersonalTrainerInteraction,
} from "../../drizzle/src/db/queries";
import { insertPersonalTrainerInteraction as insertInteraction } from "../../drizzle/src/db/mutations";
import { buildUserContext } from "../../services/context-manager";
import { getLatestProgress } from "../../services/progress-tracker";

export const personalTrainerRouter = createTRPCRouter({
  // Get all interactions for a user
  getInteractions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await getPersonalTrainerInteractions(
          ctx.userId,
          input.limit,
          input.cursor ?? undefined
        );
      } catch (error) {
        console.error("Error fetching interactions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch interactions",
        });
      }
    }),

  // Create a new interaction
  createInteraction: protectedProcedure
    .input(
      z.object({
        type: z.enum(["question", "response"]),
        content: z.string(),
        context: z.record(z.string(), z.unknown()).optional(),
        parentId: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await insertInteraction({
          userId: ctx.userId,
          type: input.type,
          content: input.content,
          context: input.context,
          parentId: input.parentId,
          metadata: input.metadata,
        });
      } catch (error) {
        console.error("Error creating interaction:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create interaction",
        });
      }
    }),

  // Get a specific interaction
  getInteraction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const interaction = await getPersonalTrainerInteraction(input.id);

        if (!interaction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Interaction not found",
          });
        }

        if (interaction.userId !== ctx.userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }

        return interaction;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching interaction:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch interaction",
        });
      }
    }),

  getContext: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    return buildUserContext(userId);
  }),

  interact: protectedProcedure
    .input(
      z.object({
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const context = await buildUserContext(userId);

      // Save the interaction
      const interaction = await insertInteraction({
        userId,
        type: "question",
        content: input.message,
        metadata: {
          sentiment: "neutral",
          keyTopics: [] as string[],
          suggestedActions: [] as string[],
        },
      });

      // For now, return a simple response
      // TODO: Replace with actual AI integration
      return {
        response: "I'm your AI personal trainer. How can I help you today?",
        interaction,
        updatedContext: context, // Return the same context for now
      };
    }),

  // Get latest progress tracking data
  getLatestProgress: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getLatestProgress(ctx.userId);
    } catch (error) {
      console.error("Error fetching latest progress:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch latest progress",
      });
    }
  }),
});
