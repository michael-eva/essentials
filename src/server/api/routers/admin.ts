import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import { PilatesVideos } from "@/drizzle/src/db/schema";
import { insertPilatesVideo } from "@/drizzle/src/db/mutations";
import { generateAiChatResponse } from "@/services/ai-chat";
import { buildUserContext } from "@/services/context-manager";

// Import Mux SDK
import Mux from "@mux/mux-node";

// Initialize Mux client with credentials
const mux = new Mux({
  tokenId: env.MUX_TOKEN_ID,
  tokenSecret: env.MUX_TOKEN_SECRET,
});

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
  // Upload video to Mux using Direct Uploads
  uploadVideo: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        fileData: z.string().optional(), // Not needed for direct uploads
      }),
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
        console.log("Creating Mux direct upload for file:", input.filename);

        // Create a direct upload using Mux SDK
        const directUpload = await mux.video.uploads.create({
          cors_origin: env.NODE_ENV === "development" ? "http://localhost:3000" : "*", // Set specific origin for dev
          new_asset_settings: {
            playback_policy: ["public"],
            video_quality: "plus", // Higher quality for pilates videos
          },
        });

        console.log("Mux direct upload created successfully:", {
          uploadId: directUpload.id,
          uploadUrl: directUpload.url,
          status: directUpload.status,
        });

        return {
          uploadId: directUpload.id,
          uploadUrl: directUpload.url,
          assetId: directUpload.asset_id, // Will be null initially
          status: directUpload.status,
        };
      } catch (error) {
        console.error("Error creating Mux direct upload:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Mux direct upload",
        });
      }
    }),

  // Check upload status and get asset information
  getUploadStatus: protectedProcedure
    .input(z.object({ uploadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin privileges
      if (env.NEXT_PUBLIC_USER_ROLE !== "DEVELOPER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required",
        });
      }

      try {
        // Check upload status
        const upload = await mux.video.uploads.retrieve(input.uploadId);

        let asset = null;
        let playbackId = null;

        // If upload has created an asset, get asset details
        if (upload.asset_id) {
          try {
            asset = await mux.video.assets.retrieve(upload.asset_id);
            // Get the public playback ID
            if (asset.playback_ids && asset.playback_ids.length > 0) {
              const publicPlayback = asset.playback_ids.find(p => p.policy === 'public');
              playbackId = publicPlayback?.id || asset.playback_ids[0]?.id;
            }
          } catch (assetError) {
            console.warn("Asset not yet available:", assetError);
          }
        }

        return {
          uploadStatus: upload.status,
          assetId: upload.asset_id,
          assetStatus: asset?.status || null,
          playbackId,
          duration: asset?.duration || null,
          aspectRatio: asset?.aspect_ratio || null,
        };
      } catch (error) {
        console.error("Error checking upload status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check upload status",
        });
      }
    }),

  // Check video processing status (legacy method for backward compatibility)
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
        // Check actual Mux status
        const asset = await mux.video.assets.retrieve(input.assetId);

        // Get the public playback ID
        let playbackId = null;
        if (asset.playback_ids && asset.playback_ids.length > 0) {
          const publicPlayback = asset.playback_ids.find(p => p.policy === 'public');
          playbackId = publicPlayback?.id || asset.playback_ids[0]?.id;
        }

        return {
          status: asset.status,
          playbackId,
          duration: asset.duration,
          aspectRatio: asset.aspect_ratio,
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
          }),
        ),
        existingData: ClassDataSchema.partial().optional(),
      }),
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
          userContext,
        );

        // Check if AI indicates extraction is complete
        let extractedData = null;
        if (aiResponse.includes("EXTRACTION_COMPLETE:")) {
          try {
            const regex = /EXTRACTION_COMPLETE:\s*({.*})/s;
            const jsonMatch = regex.exec(aiResponse);
            if (jsonMatch?.[1]) {
              const rawData = JSON.parse(jsonMatch[1]);
              extractedData = ClassDataSchema.parse(rawData);
            }
          } catch (error) {
            console.error("Error parsing extracted data:", error);
          }
        }

        return {
          message:
            aiResponse.replace(/EXTRACTION_COMPLETE:.*$/s, "").trim() ||
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
          videoUrl: input.muxPlaybackId
            ? `https://stream.mux.com/${input.muxPlaybackId}.m3u8`
            : "",
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
