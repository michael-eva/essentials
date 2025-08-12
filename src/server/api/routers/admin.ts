import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { PilatesVideos } from "~/drizzle/src/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import Mux from "@mux/mux-node";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

// Initialize Mux client
const mux = new Mux({
  tokenId: env.MUX_TOKEN_ID,
  tokenSecret: env.MUX_TOKEN_SECRET,
});

// Schema for pilates video data
const PilatesVideoInputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  difficulty: z.string(),
  duration: z.number().int().positive(),
  equipment: z.string(),
  pilatesStyle: z.string(),
  classType: z.string(),
  focusArea: z.string(),
  targetedMuscles: z.string(),
  intensity: z.number().int().min(1).max(10),
  modifications: z.boolean().default(true),
  beginnerFriendly: z.boolean().default(true),
  tags: z.string(),
  exerciseSequence: z.string(),
  instructor: z.string(),
  muxAssetId: z.string(),
  muxPlaybackId: z.string(),
});

export const adminRouter = createTRPCRouter({
  // Create Mux upload URL
  createUploadUrl: publicProcedure.query(async () => {
    try {
      const upload = await mux.video.uploads.create({
        new_asset_settings: {
          playback_policy: ["public"],
          encoding_tier: "baseline",
        },
      });

      return {
        uploadUrl: upload.url,
        uploadId: upload.id,
      };
    } catch (error) {
      console.error("Mux upload creation failed:", error);
      throw new Error("Failed to create upload URL");
    }
  }),

  // Get upload status
  getUploadStatus: publicProcedure
    .input(z.object({ uploadId: z.string() }))
    .query(async ({ input }) => {
      try {
        const upload = await mux.video.uploads.retrieve(input.uploadId);
        
        if (upload.asset_id) {
          const asset = await mux.video.assets.retrieve(upload.asset_id);
          return {
            status: upload.status,
            assetId: upload.asset_id,
            playbackId: asset.playback_ids?.[0]?.id,
            assetStatus: asset.status,
          };
        }

        return {
          status: upload.status,
          assetId: null,
          playbackId: null,
          assetStatus: null,
        };
      } catch (error) {
        console.error("Failed to get upload status:", error);
        throw new Error("Failed to get upload status");
      }
    }),

  // Extract class data using AI
  extractClassData: publicProcedure
    .input(z.object({ 
      userInput: z.string(),
      conversationHistory: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { userInput, conversationHistory = [] } = input;
        
        // Prepare the system prompt for data extraction
        const systemPrompt = `You are an AI assistant helping to extract and organize pilates class information. 
        
Your job is to:
1. Extract as much information as possible from user input to fill these fields:
   - title: Class title
   - summary: Brief 1-2 sentence summary
   - description: Detailed description
   - difficulty: beginner, intermediate, or advanced
   - duration: duration in minutes (integer)
   - equipment: required equipment
   - pilatesStyle: style of pilates (mat, reformer, etc.)
   - classType: type of class (flow, strength, flexibility, etc.)
   - focusArea: main focus area (core, full body, lower body, etc.)
   - targetedMuscles: muscles targeted
   - intensity: scale of 1-10
   - modifications: boolean if modifications are provided
   - beginnerFriendly: boolean if suitable for beginners
   - tags: comma-separated tags
   - exerciseSequence: sequence of exercises
   - instructor: instructor name

2. If information is missing, ask specific follow-up questions to gather the remaining data.

3. When you have enough information, respond with JSON in this format:
{
  "isComplete": true/false,
  "extractedData": { ... extracted fields ... },
  "missingFields": ["field1", "field2"],
  "followUpQuestion": "What additional info do you need?"
}

Keep responses conversational and helpful.`;

        // Build conversation context
        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...conversationHistory,
          { role: "user" as const, content: userInput },
        ];

        // For now, return a mock response since we need OpenAI integration
        // In a real implementation, this would call OpenAI API
        const mockResponse = {
          isComplete: false,
          extractedData: {
            title: "",
            summary: "",
            description: userInput.slice(0, 100) + "...",
            difficulty: "intermediate",
            duration: 45,
            equipment: "mat",
            pilatesStyle: "mat pilates",
            classType: "strength",
            focusArea: "core",
            targetedMuscles: "core, glutes",
            intensity: 6,
            modifications: true,
            beginnerFriendly: true,
            tags: "pilates, core, strength",
            exerciseSequence: "",
            instructor: "",
          },
          missingFields: ["title", "instructor", "exerciseSequence"],
          followUpQuestion: "I can see this is about a pilates class! Could you provide the class title, instructor name, and a brief sequence of the exercises included?",
        };

        return mockResponse;
      } catch (error) {
        console.error("AI extraction failed:", error);
        throw new Error("Failed to extract class data");
      }
    }),

  // Insert pilates video into database
  insertPilatesVideo: publicProcedure
    .input(PilatesVideoInputSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await db.insert(PilatesVideos).values({
          title: input.title,
          summary: input.summary,
          description: input.description,
          difficulty: input.difficulty,
          duration: input.duration,
          equipment: input.equipment,
          pilatesStyle: input.pilatesStyle,
          classType: input.classType,
          focusArea: input.focusArea,
          targetedMuscles: input.targetedMuscles,
          intensity: input.intensity,
          modifications: input.modifications,
          beginnerFriendly: input.beginnerFriendly,
          tags: input.tags,
          exerciseSequence: input.exerciseSequence,
          videoUrl: `https://stream.mux.com/${input.muxPlaybackId}.m3u8`,
          muxAssetId: input.muxAssetId,
          mux_playback_id: input.muxPlaybackId,
          instructor: input.instructor,
        }).returning();

        return result[0];
      } catch (error) {
        console.error("Database insertion failed:", error);
        throw new Error("Failed to insert pilates video");
      }
    }),
});