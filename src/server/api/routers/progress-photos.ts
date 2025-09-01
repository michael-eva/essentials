import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { progressPhotos, insertProgressPhotosSchema } from "@/drizzle/src/db/schema";
import { db } from "@/drizzle/src/db/mutations";
import { desc, eq } from "drizzle-orm";
import { supabase } from "@/lib/supabase/client";

export const progressPhotosRouter = createTRPCRouter({
  // Get all progress photos for the current user
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const photos = await db
        .select()
        .from(progressPhotos)
        .where(eq(progressPhotos.userId, ctx.session.user.id))
        .orderBy(desc(progressPhotos.takenAt));

      return photos;
    }),

  // Upload a new progress photo
  upload: protectedProcedure
    .input(
      z.object({
        imageData: z.string(), // Base64 encoded image data
        fileName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Create unique storage path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const storagePath = `progress-photos/${userId}/${timestamp}-${input.fileName}`;
      
      // Convert base64 to buffer
      const base64Data = input.imageData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(storagePath, buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(storagePath);

      // Save metadata to database
      const [photo] = await db
        .insert(progressPhotos)
        .values({
          userId,
          imageUrl: publicUrlData.publicUrl,
          storagePath,
        })
        .returning();

      return photo;
    }),

  // Delete a progress photo
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get photo data to verify ownership and get storage path
      const [photo] = await db
        .select()
        .from(progressPhotos)
        .where(eq(progressPhotos.id, input.id));

      if (!photo) {
        throw new Error("Photo not found");
      }

      if (photo.userId !== userId) {
        throw new Error("Unauthorized: You can only delete your own photos");
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('progress-photos')
        .remove([photo.storagePath]);

      if (storageError) {
        console.error("Failed to delete from storage:", storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      await db
        .delete(progressPhotos)
        .where(eq(progressPhotos.id, input.id));

      return { success: true };
    }),
});