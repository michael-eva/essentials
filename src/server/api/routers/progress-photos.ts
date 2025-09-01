import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  progressPhotos,
  insertProgressPhotosSchema,
} from "@/drizzle/src/db/schema";
import { eq } from "drizzle-orm";
import { getProgressPhotos } from "@/drizzle/src/db/queries";
import {
  deleteProgressPhotos,
  insertProgressPhotos,
} from "@/drizzle/src/db/mutations";

export const progressPhotosRouter = createTRPCRouter({
  // Get all progress photos for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const photos = await getProgressPhotos(ctx.userId);

    return photos;
  }),

  // Upload a new progress photo
  upload: protectedProcedure
    .input(
      z.object({
        imageData: z.string(), // Base64 encoded image data
        fileName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Create unique storage path
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const storagePath = `progress-photos/${userId}/${timestamp}-${input.fileName}`;

      // Convert base64 to buffer
      const base64Data = input.imageData.split(",", 2)[1] ?? input.imageData;
      const buffer = Buffer.from(base64Data, "base64");

      // Detect MIME type from base64 data
      const mimeMatch = input.imageData.match(/^data:([^;]+);base64,/);
      const contentType = mimeMatch ? mimeMatch[1] : "image/jpeg";

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } =
        await ctx.supabase.storage
          .from("progress-photos")
          .upload(storagePath, buffer, {
            contentType,
            upsert: false,
          });

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = ctx.supabase.storage
        .from("progress-photos")
        .getPublicUrl(storagePath);

      // Save metadata to database
      const photo = await insertProgressPhotos({
        userId,
        imageUrl: publicUrlData.publicUrl,
        storagePath,
      });

      return photo;
    }),

  // Delete a progress photo
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Get photo data to verify ownership and get storage path
      const photos = await getProgressPhotos(userId);
      const photo = photos.find(p => p.id === input.id);

      if (!photo) {
        throw new Error("Photo not found");
      }

      if (photo.userId !== userId) {
        throw new Error("Unauthorized: You can only delete your own photos");
      }

      // Delete from storage
      const { error: storageError } = await ctx.supabase.storage
        .from("progress-photos")
        .remove([photo.storagePath]);

      if (storageError) {
        console.error("Failed to delete from storage:", storageError);
        // Continue with database deletion even if storage deletion fails
      }

      await deleteProgressPhotos(userId, input.id);

      return { success: true };
    }),
});
