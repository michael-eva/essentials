import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  getPersonalTrainerInteractions,
  getPersonalTrainerInteraction,
} from "@/drizzle/src/db/queries";
import { insertPersonalTrainerInteraction } from "@/drizzle/src/db/mutations";

export const personalTrainerRouter = createTRPCRouter({
  // Get all interactions for a user
  getInteractions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        return await getPersonalTrainerInteractions(
          ctx.userId,
          input.limit,
          input.cursor ?? undefined,
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
        context: z.record(z.unknown()).optional(),
        parentId: z.string().optional(),
        metadata: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await insertPersonalTrainerInteraction({
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
});
