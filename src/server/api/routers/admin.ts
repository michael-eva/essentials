import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import { PilatesVideos } from "@/drizzle/src/db/schema";
import { insertPilatesVideo } from "@/drizzle/src/db/mutations";
import { generateAiChatResponse } from "@/services/ai-chat";
import { buildUserContext } from "@/services/context-manager";

// Note: Mux SDK will be imported once the dependency is installed
// import Mux from '@mux/mux-node';

// Schema for class data validation
const ClassDataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  duration: z.number().int().positive("Duration must be a positive number"),
  equipment: z.string().min(1, "Equipment is required"),
  pilatesStyle: z.string().min(1, "Pilates style is required"),
  classType: z.string().min(1, "Class type is required"),
  focusArea: z.string().min(1, "Focus area is required"),
  targetedMuscles: z.string().min(1, "Targeted muscles is required"),
  intensity: z.number().int().min(1).max(10, "Intensity must be between 1-10"),
  modifications: z.boolean(),
  beginnerFriendly: z.boolean(),
  tags: z.string().min(1, "Tags are required"),
  exerciseSequence: z.string().min(1, "Exercise sequence is required"),
  instructor: z.string().min(1, "Instructor is required"),
  muxPlaybackId: z.string().optional(),
  muxAssetId: z.string().optional(),
});

export const adminRouter = createTRPCRouter({
  // Upload video to Mux
  uploadVideo: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        fileData: z.string(), // base64 encoded file data
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin privileges
      if (env.NEXT_PUBLIC_USER_ROLE !== "DEVELOPER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required",
        });
      }

      try {
        // TODO: Initialize Mux client once dependency is installed
        /*
        const { Video } = new Mux(env.MUX_TOKEN_ID, env.MUX_TOKEN_SECRET);
        
        // Convert base64 to buffer
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        
        // Create asset in Mux
        const asset = await Video.Assets.create({
          input: [{
            url: `data:${input.contentType};base64,${input.fileData}`
          }],
          playback_policy: ['public'],
          mp4_support: 'standard',
        });

        return {
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
          status: asset.status,
        };
        */

        // Placeholder response until Mux SDK is installed
        const mockAssetId = `mock_asset_${Date.now()}`;
        const mockPlaybackId = `mock_playback_${Date.now()}`;
        
        return {
          assetId: mockAssetId,
          playbackId: mockPlaybackId,
          status: "preparing", // Mock status
        };
      } catch (error) {
        console.error("Error uploading to Mux:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload video to Mux",
        });
      }
    }),

  // Check video processing status
  getVideoStatus: protectedProcedure
    .input(z.object({ assetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin privileges
      if (env.NEXT_PUBLIC_USER_ROLE !== "DEVELOPER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required",
        });
      }

      try {
        // TODO: Check actual Mux status once dependency is installed
        /*
        const { Video } = new Mux(env.MUX_TOKEN_ID, env.MUX_TOKEN_SECRET);
        const asset = await Video.Assets.retrieve(input.assetId);
        
        return {
          status: asset.status,
          duration: asset.duration,
          aspectRatio: asset.aspect_ratio,
        };
        */

        // Mock response - always return ready after a delay
        return {
          status: "ready",
          duration: 2700, // 45 minutes in seconds
          aspectRatio: "16:9",
        };
      } catch (error) {
        console.error("Error checking video status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check video status",
        });
      }
    }),

  // Extract class data using AI
  extractClassData: protectedProcedure
    .input(
      z.object({
        userInput: z.string().min(1, "User input is required"),
        chatHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
            timestamp: z.date(),
          })
        ),
        existingData: ClassDataSchema.partial().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin privileges
      if (env.NEXT_PUBLIC_USER_ROLE !== "DEVELOPER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required",
        });
      }

      try {
        // Build system prompt for pilates class data extraction
        const systemPrompt = `You are an AI assistant helping to extract and organize pilates class information for a class management system. 

Your job is to:
1. Extract class information from user input
2. Ask clarifying questions for missing required fields
3. Organize data into the required schema format
4. Be conversational and helpful

REQUIRED FIELDS for pilates class:
- title (string): Class name/title
- summary (string): Brief 1-2 sentence description 
- description (string): Detailed class description
- difficulty (string): "Beginner", "Intermediate", or "Advanced"
- duration (number): Class length in minutes
- equipment (string): Required equipment (e.g., "Mat", "Mat and small ball", "No equipment")
- pilatesStyle (string): Style of pilates (e.g., "Classical", "Contemporary", "Reformer", "Mat")
- classType (string): Type of class (e.g., "Core Focus", "Full Body", "Strength", "Flexibility")
- focusArea (string): Primary focus (e.g., "Core", "Full Body", "Lower Body", "Upper Body")
- targetedMuscles (string): Muscles targeted (e.g., "Core, Glutes, Back")
- intensity (number): 1-10 scale
- modifications (boolean): Whether modifications are provided
- beginnerFriendly (boolean): Suitable for beginners
- tags (string): Comma-separated tags for searchability
- exerciseSequence (string): List or description of exercises in order
- instructor (string): Instructor name

If the user provides information, extract what you can and ask for missing required fields. 
When you have ALL required information, respond with "EXTRACTION_COMPLETE:" followed by the JSON data.

Be conversational and ask one question at a time to make it feel natural.

Current extraction status: ${input.existingData ? "Some data already extracted" : "Starting fresh"}

Chat context: User has provided: "${input.userInput}"`;

        // Create a user context for AI (minimal for admin tasks)
        const userContext = await buildUserContext(ctx.userId);

        // Generate AI response using existing chat system
        const aiResponse = await generateAiChatResponse(
          `${systemPrompt}\n\nUser says: ${input.userInput}`,
          ctx.userId,
          userContext
        );

        // Check if AI indicates extraction is complete
        let extractedData = null;
        if (aiResponse.includes("EXTRACTION_COMPLETE:")) {
          try {
            const jsonMatch = aiResponse.match(/EXTRACTION_COMPLETE:\s*({.*})/s);
            if (jsonMatch) {
              const rawData = JSON.parse(jsonMatch[1]);
              extractedData = ClassDataSchema.parse(rawData);
            }
          } catch (error) {
            console.error("Error parsing extracted data:", error);
          }
        }

        return {
          message: aiResponse.replace(/EXTRACTION_COMPLETE:.*$/s, "").trim() || 
                   "I've organized your class information! Please review the details below.",
          extractedData,
          isComplete: !!extractedData,
        };
      } catch (error) {
        console.error("Error in AI data extraction:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process class data with AI",
        });
      }
    }),

  // Create pilates video entry
  createPilatesVideo: protectedProcedure
    .input(ClassDataSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin privileges
      if (env.NEXT_PUBLIC_USER_ROLE !== "DEVELOPER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required",
        });
      }

      try {
        // Insert into pilates_videos table
        const pilatesVideo = await insertPilatesVideo({
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
          instructor: input.instructor,
          videoUrl: input.muxPlaybackId ? `https://stream.mux.com/${input.muxPlaybackId}.m3u8` : "",
          muxAssetId: input.muxAssetId,
          mux_playback_id: input.muxPlaybackId,
        });

        return pilatesVideo;
      } catch (error) {
        console.error("Error creating pilates video:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create pilates class",
        });
      }
    }),
});