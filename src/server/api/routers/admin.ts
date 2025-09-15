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
import {
  getPilatesVideos,
  getPilatesVideoById,
  getUploadQueueItems,
  getUploadQueueItem,
  getAllActiveUploads,
  getUploadQueueItemByMuxUploadId,
  getFailedUploads,
} from "@/drizzle/src/db/queries";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql, count, desc, eq } from "drizzle-orm";
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
  thumbnailTimestamp: z
    .number()
    .int()
    .min(0, "Timestamp must be 0 or greater")
    .default(35),
});

export const adminRouter = createTRPCRouter({
  // Upload video to Mux using Direct Uploads
  uploadVideo: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        fileSize: z.number().optional(),
        fileData: z.string().optional(), // Not needed for direct uploads
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin privileges
      if (ctx.userRole !== "admin") {
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

        // Add to upload queue for tracking
        // const queueItem = await insertUploadQueueItem({
        //   userId: ctx.userId,
        //   filename: input.filename,
        //   contentType: input.contentType,
        //   fileSize: input.fileSize || null,
        //   muxUploadId: directUpload.id,
        //   uploadStatus: "pending",
        //   uploadProgress: 0,
        //   aiExtractionStatus: "pending",
        //   aiExtractionProgress: 0,
        // });

        // console.log("Added to upload queue:", queueItem.id);

        return {
          uploadId: directUpload.id,
          uploadUrl: directUpload.url,
          assetId: directUpload.asset_id, // Will be null initially
          status: directUpload.status,
          // queueId: queueItem.id, // Return queue ID for tracking
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
      if (ctx.userRole !== "admin") {
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

        // Update upload queue with current status
        const queueItem = await getUploadQueueItemByMuxUploadId(input.uploadId);
        if (queueItem) {
          let newStatus:
            | "pending"
            | "uploading"
            | "processing"
            | "completed"
            | "failed" = "pending";

          // Map Mux status to our queue status
          if (upload.status === "waiting") {
            newStatus = "pending";
          } else if (upload.status === "asset_created") {
            if (asset?.status === "ready") {
              newStatus = "completed";
            } else if (asset?.status === "preparing") {
              newStatus = "processing";
            }
          } else if (upload.status === "errored") {
            newStatus = "failed";
          }

          // await updateUploadQueueItem(queueItem.id, {
          //   uploadStatus: newStatus,
          //   muxAssetId: upload.asset_id || null,
          //   muxPlaybackId: playbackId || null,
          //   uploadProgress:
          //     newStatus === "completed" ? 100 : queueItem.uploadProgress,
          //   completedAt: newStatus === "completed" ? new Date() : null,
          // });
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
      if (ctx.userRole !== "admin") {
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
      if (ctx.userRole !== "admin") {
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
- instructor (string): REQUIRED - Instructor name (cannot be empty or null)
- thumbnailTimestamp (number): REQUIRED - Timestamp in seconds for video thumbnail (ask user for time in mm:ss format like "01:25" then convert to seconds)

OPTIONAL CONTEXT (do not block completion if missing; include in description or tags if present):
- Pre/Postnatal suitability notes
- Injury avoidance notes for specific areas (e.g., shoulders, wrists, neck)

Guidelines:
- Prefer inferring from the conversation over asking. Only ask if a truly required field cannot be confidently inferred.
- If a short marketing-style blurb is present, use it to create the summary.
- Normalize values to the required format (e.g., map ranges to a single difficulty; convert durations like "7 minutes" to 7).
- If existing extracted data is provided, treat it as ground truth unless contradicted by newer user input.
- The instructor field MUST have a value - if not provided, ask for it or use a default like "Unknown Instructor" as a last resort.
- When you have ALL required information, respond with "EXTRACTION_COMPLETE:" followed by only the JSON data (no markdown code fences).
- Always make sure that you have all the required information before responding with EXTRACTION_COMPLETE.
- Never output empty strings or null values for required fields.`;

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
              console.log(
                "Raw extracted data before validation:",
                JSON.stringify(rawData, null, 2),
              );

              // Check for critical required fields before validation
              const requiredFields = [
                "title",
                "summary",
                "description",
                "difficulty",
                "duration",
                "equipment",
                "pilatesStyle",
                "classType",
                "focusArea",
                "targetedMuscles",
                "intensity",
                "modifications",
                "beginnerFriendly",
                "tags",
                "exerciseSequence",
                "instructor",
                "thumbnailTimestamp",
              ];
              const missingFields = requiredFields.filter(
                (field) =>
                  !rawData[field] ||
                  (typeof rawData[field] === "string" &&
                    rawData[field].trim() === "") ||
                  (Array.isArray(rawData[field]) &&
                    rawData[field].length === 0),
              );

              if (missingFields.length > 0) {
                console.error(
                  "Missing or empty required fields:",
                  missingFields,
                );
                throw new Error(
                  `Missing required fields: ${missingFields.join(", ")}`,
                );
              }

              extractedData = ClassDataSchema.parse(rawData);
            }
          } catch (error) {
            console.error("Error parsing extracted data:", error);
            if (error instanceof z.ZodError) {
              console.error("Validation errors:", error.issues);
            }
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
      if (ctx.userRole !== "admin") {
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
          thumbnailTimestamp: input.thumbnailTimestamp,
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
      if (ctx.userRole !== "admin") {
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
      if (ctx.userRole !== "admin") {
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
      if (ctx.userRole !== "admin") {
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
  getVideoStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if user has admin privileges
    if (ctx.userRole !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin privileges required",
      });
    }

    try {
      const client = postgres(env.DATABASE_URL);
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
  getAllDrafts: protectedProcedure.query(async ({ ctx }) => {
    // Check if user has admin privileges
    if (ctx.userRole !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin privileges required",
      });
    }

    try {
      const client = postgres(env.DATABASE_URL);
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

  // Get all published videos for admin management
  getVideos: protectedProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(50).default(10),
          difficulty: z.string().optional(),
          equipment: z.string().optional(),
          instructor: z.string().optional(),
          minDuration: z.number().optional(),
          maxDuration: z.number().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      // Check if user has admin privileges
      if (ctx.userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required",
        });
      }

      try {
        const page = input?.page ?? 1;
        const limit = input?.limit ?? 10;
        const offset = (page - 1) * limit;

        return await getPilatesVideos({
          ...input,
          limit,
          offset,
        });
      } catch (error) {
        console.error("Error getting videos for admin:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get videos",
        });
      }
    }),

  // Update video metadata
  updateVideo: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Title is required").optional(),
        summary: z.string().min(1, "Summary is required").optional(),
        description: z.string().min(1, "Description is required").optional(),
        difficulty: z.string().min(1, "Difficulty is required").optional(),
        duration: z
          .number()
          .int()
          .positive("Duration must be a positive number")
          .optional(),
        equipment: z.string().min(1, "Equipment is required").optional(),
        pilatesStyle: z.string().min(1, "Pilates style is required").optional(),
        classType: z.string().min(1, "Class type is required").optional(),
        focusArea: z.string().min(1, "Focus area is required").optional(),
        targetedMuscles: z
          .string()
          .min(1, "Targeted muscles is required")
          .optional(),
        intensity: z
          .number()
          .int()
          .min(1)
          .max(10, "Intensity must be between 1-10")
          .optional(),
        modifications: z.boolean().optional(),
        beginnerFriendly: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
        exerciseSequence: z.array(z.string()).optional(),
        instructor: z.string().min(1, "Instructor is required").optional(),
        thumbnailTimestamp: z
          .number()
          .int()
          .min(0, "Timestamp must be 0 or greater")
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin privileges
      if (ctx.userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required",
        });
      }

      try {
        const client = postgres(env.DATABASE_URL);
        const db = drizzle(client);

        // First check if video exists
        const existingVideo = await getPilatesVideoById(input.id);
        if (!existingVideo) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Video not found",
          });
        }

        // Filter out undefined values
        const updateData = Object.fromEntries(
          Object.entries(input).filter(([_, value]) => value !== undefined),
        );
        delete updateData.id; // Remove id from update data

        if (Object.keys(updateData).length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No update data provided",
          });
        }

        const result = await db
          .update(PilatesVideos)
          .set({
            ...updateData,
            updatedAt: sql`now()`,
          })
          .where(eq(PilatesVideos.id, input.id))
          .returning();

        return result[0];
      } catch (error) {
        console.error("Error updating video:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update video",
        });
      }
    }),

  // Delete video
  deleteVideo: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin privileges
      if (ctx.userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required",
        });
      }

      try {
        const client = postgres(env.DATABASE_URL);
        const db = drizzle(client);

        // First get the video to check Mux asset ID
        const video = await getPilatesVideoById(input.id);
        if (!video) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Video not found",
          });
        }

        // Delete from Mux if asset exists
        if (video.muxAssetId) {
          try {
            await mux.video.assets.delete(video.muxAssetId);
            console.log("Deleted Mux asset:", video.muxAssetId);
          } catch (muxError) {
            console.warn("Failed to delete Mux asset:", muxError);
            // Continue with database deletion even if Mux deletion fails
          }
        }

        // Delete from database
        const result = await db
          .delete(PilatesVideos)
          .where(eq(PilatesVideos.id, input.id))
          .returning();

        if (result.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Video not found",
          });
        }

        return { success: true, deletedVideo: result[0] };
      } catch (error) {
        console.error("Error deleting video:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete video",
        });
      }
    }),

  // Upload Queue Management Routes

  // Get upload queue items for current user
  getUploadQueue: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      if (ctx.userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required",
        });
      }

      try {
        const limit = input?.limit ?? 20;
        const offset = input?.offset ?? 0;
        return await getUploadQueueItems(ctx.userId, limit, offset);
      } catch (error) {
        console.error("Error getting upload queue:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get upload queue",
        });
      }
    }),

  // Get all active uploads across all users (admin only)
  getAllActiveUploads: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.userRole !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin privileges required",
      });
    }

    try {
      return await getAllActiveUploads();
    } catch (error) {
      console.error("Error getting active uploads:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get active uploads",
      });
    }
  }),

  // Get single upload queue item
  getUploadQueueItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required",
        });
      }

      try {
        const item = await getUploadQueueItem(input.id);
        if (!item) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Upload queue item not found",
          });
        }
        return item;
      } catch (error) {
        console.error("Error getting upload queue item:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get upload queue item",
        });
      }
    }),

  // Update upload progress manually
  // updateUploadProgress: protectedProcedure
  //   .input(
  //     z.object({
  //       id: z.string(),
  //       progress: z.number().min(0).max(100),
  //       status: z
  //         .enum([
  //           "pending",
  //           "uploading",
  //           "processing",
  //           "completed",
  //           "failed",
  //           "cancelled",
  //         ])
  //         .optional(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     if (ctx.userRole !== "admin") {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Admin privileges required",
  //       });
  //     }

  //     try {
  //       const result = await updateUploadProgress(
  //         input.id,
  //         input.progress,
  //         input.status,
  //       );
  //       if (!result) {
  //         throw new TRPCError({
  //           code: "NOT_FOUND",
  //           message: "Upload queue item not found",
  //         });
  //       }
  //       return result;
  //     } catch (error) {
  //       console.error("Error updating upload progress:", error);
  //       if (error instanceof TRPCError) {
  //         throw error;
  //       }
  //       throw new TRPCError({
  //         code: "INTERNAL_SERVER_ERROR",
  //         message: "Failed to update upload progress",
  //       });
  //     }
  //   }),

  // // Update AI extraction progress
  // updateAiExtractionProgress: protectedProcedure
  //   .input(
  //     z.object({
  //       id: z.string(),
  //       progress: z.number().min(0).max(100),
  //       status: z
  //         .enum([
  //           "pending",
  //           "uploading",
  //           "processing",
  //           "completed",
  //           "failed",
  //           "cancelled",
  //         ])
  //         .optional(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     if (ctx.userRole !== "admin") {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Admin privileges required",
  //       });
  //     }

  //     try {
  //       const result = await updateAiExtractionProgress(
  //         input.id,
  //         input.progress,
  //         input.status,
  //       );
  //       if (!result) {
  //         throw new TRPCError({
  //           code: "NOT_FOUND",
  //           message: "Upload queue item not found",
  //         });
  //       }
  //       return result;
  //     } catch (error) {
  //       console.error("Error updating AI extraction progress:", error);
  //       if (error instanceof TRPCError) {
  //         throw error;
  //       }
  //       throw new TRPCError({
  //         code: "INTERNAL_SERVER_ERROR",
  //         message: "Failed to update AI extraction progress",
  //       });
  //     }
  //   }),

  // Cancel upload
  // cancelUpload: protectedProcedure
  //   .input(z.object({ id: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     if (ctx.userRole !== "admin") {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Admin privileges required",
  //       });
  //     }

  //     try {
  //       const result = await updateUploadQueueItem(input.id, {
  //         uploadStatus: "cancelled",
  //         completedAt: new Date(),
  //       });

  //       if (!result) {
  //         throw new TRPCError({
  //           code: "NOT_FOUND",
  //           message: "Upload queue item not found",
  //         });
  //       }

  //       return result;
  //     } catch (error) {
  //       console.error("Error cancelling upload:", error);
  //       if (error instanceof TRPCError) {
  //         throw error;
  //       }
  //       throw new TRPCError({
  //         code: "INTERNAL_SERVER_ERROR",
  //         message: "Failed to cancel upload",
  //       });
  //     }
  //   }),

  // // Delete upload queue item
  // deleteUploadQueueItem: protectedProcedure
  //   .input(z.object({ id: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     if (ctx.userRole !== "admin") {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Admin privileges required",
  //       });
  //     }

  //     try {
  //       const result = await deleteUploadQueueItem(input.id);
  //       if (!result) {
  //         throw new TRPCError({
  //           code: "NOT_FOUND",
  //           message: "Upload queue item not found",
  //         });
  //       }
  //       return { success: true };
  //     } catch (error) {
  //       console.error("Error deleting upload queue item:", error);
  //       if (error instanceof TRPCError) {
  //         throw error;
  //       }
  //       throw new TRPCError({
  //         code: "INTERNAL_SERVER_ERROR",
  //         message: "Failed to delete upload queue item",
  //       });
  //     }
  //   }),

  // // Get failed uploads for retry
  // getFailedUploads: protectedProcedure
  //   .input(
  //     z
  //       .object({
  //         limit: z.number().min(1).max(50).default(10),
  //       })
  //       .optional(),
  //   )
  //   .query(async ({ ctx, input }) => {
  //     if (ctx.userRole !== "admin") {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Admin privileges required",
  //       });
  //     }

  //     try {
  //       const limit = input?.limit ?? 10;
  //       return await getFailedUploads(ctx.userId, limit);
  //     } catch (error) {
  //       console.error("Error getting failed uploads:", error);
  //       throw new TRPCError({
  //         code: "INTERNAL_SERVER_ERROR",
  //         message: "Failed to get failed uploads",
  //       });
  //     }
  //   }),
});
