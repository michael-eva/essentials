import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import { PilatesVideos } from "@/drizzle/src/db/schema";
import {
  insertPilatesVideo,
  insertOrUpdateClassDraft,
  getClassDraft,
  deleteClassDraft,
} from "@/drizzle/src/db/mutations";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql, count, desc } from "drizzle-orm";
import { classDrafts } from "@/drizzle/src/db/schema";
import { generateAdminAiResponse } from "@/services/ai-chat";

// Import Mux SDK
import Mux from "@mux/mux-node";
import { getUser } from "@/drizzle/src/db/queries";

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
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  exerciseSequence: z
    .array(z.string())
    .min(1, "At least one exercise is required"),
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
          cors_origin:
            env.NODE_ENV === "development" ? "http://localhost:3000" : "*", // Set specific origin for dev
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
              const publicPlayback = asset.playback_ids.find(
                (p) => p.policy === "public",
              );
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
          const publicPlayback = asset.playback_ids.find(
            (p) => p.policy === "public",
          );
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
        // Build conversation context from chat history so the AI can infer from prior messages
        const chatHistoryText = (input.chatHistory || [])
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n");

        // Build system prompt for pilates class data extraction
        const systemPrompt = `You are an AI assistant helping to extract and organize pilates class information for a class management system.

Your job is to:
1. Extract class information from the entire conversation and latest user input
2. Infer as many required fields as possible from context without asking redundant questions, but if you are not sure, ask the user for clarification.
3. Organize data into the required schema format
4. Be conversational and helpful

REQUIRED FIELDS for pilates class (must be present in the final JSON):
- title (string): Class name/title
- summary (string): Brief 1-2 sentence description
- description (string): Detailed class description
- difficulty (string): "Beginner", "Intermediate", or "Advanced" (if a range like "Beginner–Intermediate" is provided, choose the closest single value)
- duration (number): Class length in minutes
- equipment (string): Required equipment (e.g., "Mat", "Mat and small ball", "No equipment")
- pilatesStyle (string): Style of pilates (e.g., "Classical", "Contemporary", "Reformer", "Mat")
- classType (string): Type of class (e.g., "Core Focus", "Full Body", "Strength", "Flexibility")
- focusArea (string): Primary focus (e.g., "Core", "Full Body", "Lower Body", "Upper Body")
- targetedMuscles (string): Muscles targeted (e.g., "Core, Glutes, Back")
- intensity (number): 1-10 scale (infer reasonably if a qualitative description suggests a level)
- modifications (boolean): Whether modifications are provided
- beginnerFriendly (boolean): Suitable for beginners
- tags (array): Array of tags for searchability
- exerciseSequence (array): Array of exercises in order
- instructor (string): Instructor name

OPTIONAL CONTEXT (do not block completion if missing; include in description or tags if present):
- Pre/Postnatal suitability notes
- Injury avoidance notes for specific areas (e.g., shoulders, wrists, neck)

Guidelines:
- Prefer inferring from the conversation over asking. Only ask if a truly required field cannot be confidently inferred.
- If a short marketing-style blurb is present, use it to create the summary.
- Normalize values to the required format (e.g., map ranges to a single difficulty; convert durations like "7 minutes" to 7).
- If existing extracted data is provided, treat it as ground truth unless contradicted by newer user input.
- When you have ALL required information, respond with "EXTRACTION_COMPLETE:" followed by only the JSON data (no markdown code fences).
- Always make sure that you have all the required information before responding with EXTRACTION_COMPLETE.`;

        const existingDataText = input.existingData
          ? `\n\nExisting extracted data (may be partial): ${JSON.stringify(input.existingData)}`
          : "";

        const fullPrompt = `${systemPrompt}\n\n=== Conversation so far ===\n${chatHistoryText}\n\n=== Latest user message ===\n${input.userInput}${existingDataText}`;

        // Generate AI response using simplified admin function
        const aiResponse = await generateAdminAiResponse(fullPrompt);

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
        // Log the input data for debugging
        console.log("Creating pilates video with data:", {
          title: input.title,
          muxAssetId: input.muxAssetId,
          muxPlaybackId: input.muxPlaybackId,
          tags: input.tags,
          exerciseSequence: input.exerciseSequence,
        });

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

  // Load draft data
  loadDraft: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user has admin privileges
      if (env.NEXT_PUBLIC_USER_ROLE !== "DEVELOPER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required",
        });
      }

      try {
        const draft = await getClassDraft(ctx.userId, input.sessionId);
        return draft;
      } catch (error) {
        console.error("Error loading draft:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load draft",
        });
      }
    }),

  // Save draft data
  saveDraft: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        muxAssetId: z.string().optional(),
        muxPlaybackId: z.string().optional(),
        chatHistory: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
              timestamp: z.string(),
            }),
          )
          .optional(),
        extractedData: ClassDataSchema.partial().optional(),
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
        const draft = await insertOrUpdateClassDraft({
          userId: ctx.userId,
          sessionId: input.sessionId,
          muxAssetId: input.muxAssetId,
          muxPlaybackId: input.muxPlaybackId,
          chatHistory: input.chatHistory,
          extractedData: input.extractedData,
        });
        return draft;
      } catch (error) {
        console.error("Error saving draft:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save draft",
        });
      }
    }),

  // Delete draft data
  deleteDraft: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin privileges
      if (env.NEXT_PUBLIC_USER_ROLE !== "DEVELOPER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required",
        });
      }

      try {
        await deleteClassDraft(ctx.userId, input.sessionId);
        return { success: true };
      } catch (error) {
        console.error("Error deleting draft:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete draft",
        });
      }
    }),

  // Get video statistics for admin dashboard
  getVideoStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Check if user has admin privileges
      if (env.NEXT_PUBLIC_USER_ROLE !== "DEVELOPER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required",
        });
      }

      try {
        const client = postgres(process.env.DATABASE_URL!);
        const db = drizzle(client);

        const [liveVideosResult, draftVideosResult] = await Promise.all([
          db.select({ count: count() }).from(PilatesVideos),
          db.select({ count: count() }).from(classDrafts),
        ]);

        return {
          liveVideos: liveVideosResult[0]?.count ?? 0,
          draftVideos: draftVideosResult[0]?.count ?? 0,
        };
      } catch (error) {
        console.error("Error getting video stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get video statistics",
        });
      }
    }),

  // Get all draft videos for admin management
  getAllDrafts: protectedProcedure
    .query(async ({ ctx }) => {
      // Check if user has admin privileges
      if (env.NEXT_PUBLIC_USER_ROLE !== "DEVELOPER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required",
        });
      }

      try {
        const client = postgres(process.env.DATABASE_URL!);
        const db = drizzle(client);

        const drafts = await db
          .select()
          .from(classDrafts)
          .orderBy(desc(classDrafts.updatedAt));

        return drafts;
      } catch (error) {
        console.error("Error getting all drafts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get draft videos",
        });
      }
    }),
});
