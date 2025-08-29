import { env } from "@/env";
import { 
  getAllActiveUploads,
  getUploadQueueItem,
  getUploadQueueItemByMuxUploadId
} from "@/drizzle/src/db/queries";
import { 
  updateUploadProgress,
  updateAiExtractionProgress,
  updateUploadQueueItem,
  setUploadError
} from "@/drizzle/src/db/mutations";
import Mux from "@mux/mux-node";

// Initialize Mux client
const mux = new Mux({
  tokenId: env.MUX_TOKEN_ID,
  tokenSecret: env.MUX_TOKEN_SECRET,
});

export class UploadQueuePoller {
  private static instance: UploadQueuePoller;
  private intervalId: NodeJS.Timeout | null = null;
  private isPolling = false;
  private readonly pollInterval = 10000; // 10 seconds

  private constructor() {}

  public static getInstance(): UploadQueuePoller {
    if (!UploadQueuePoller.instance) {
      UploadQueuePoller.instance = new UploadQueuePoller();
    }
    return UploadQueuePoller.instance;
  }

  public start(): void {
    if (this.isPolling) {
      console.log("Upload queue poller is already running");
      return;
    }

    console.log("Starting upload queue poller...");
    this.isPolling = true;
    
    // Start polling immediately, then set interval
    this.pollActiveUploads().catch(console.error);
    
    this.intervalId = setInterval(() => {
      this.pollActiveUploads().catch(console.error);
    }, this.pollInterval);
  }

  public stop(): void {
    if (!this.isPolling) {
      return;
    }

    console.log("Stopping upload queue poller...");
    this.isPolling = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public isRunning(): boolean {
    return this.isPolling;
  }

  private async pollActiveUploads(): Promise<void> {
    try {
      const activeUploads = await getAllActiveUploads();
      
      if (activeUploads.length === 0) {
        return;
      }

      console.log(`Polling ${activeUploads.length} active uploads...`);

      // Process uploads concurrently but limit concurrency
      const batchSize = 5;
      for (let i = 0; i < activeUploads.length; i += batchSize) {
        const batch = activeUploads.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(upload => this.processUpload(upload))
        );
      }
    } catch (error) {
      console.error("Error in upload queue poller:", error);
    }
  }

  private async processUpload(queueItem: any): Promise<void> {
    if (!queueItem.muxUploadId) {
      console.warn(`Queue item ${queueItem.id} has no mux upload ID`);
      return;
    }

    try {
      // Check upload status with Mux
      const upload = await mux.video.uploads.retrieve(queueItem.muxUploadId);
      
      let asset = null;
      let playbackId = null;
      let shouldUpdateQueue = false;
      let newStatus = queueItem.uploadStatus;
      let newProgress = queueItem.uploadProgress;

      // Check if upload has created an asset
      if (upload.asset_id && upload.asset_id !== queueItem.muxAssetId) {
        try {
          asset = await mux.video.assets.retrieve(upload.asset_id);
          
          // Get playback ID
          if (asset.playback_ids && asset.playback_ids.length > 0) {
            const publicPlayback = asset.playback_ids.find(
              (p) => p.policy === "public"
            );
            playbackId = publicPlayback?.id || asset.playback_ids[0]?.id;
          }
          
          shouldUpdateQueue = true;
        } catch (assetError) {
          console.warn(`Asset ${upload.asset_id} not yet available:`, assetError);
        }
      } else if (upload.asset_id) {
        // Asset was already retrieved, just check status
        try {
          asset = await mux.video.assets.retrieve(upload.asset_id);
          playbackId = queueItem.muxPlaybackId; // Use existing playback ID
          shouldUpdateQueue = true;
        } catch (assetError) {
          console.warn(`Error checking asset ${upload.asset_id}:`, assetError);
        }
      }

      // Map Mux status to our queue status and progress
      if (upload.status === "waiting") {
        newStatus = "pending";
        newProgress = 0;
        shouldUpdateQueue = true;
      } else if (upload.status === "asset_created") {
        if (asset?.status === "ready") {
          newStatus = "completed";
          newProgress = 100;
          shouldUpdateQueue = true;
        } else if (asset?.status === "preparing") {
          newStatus = "processing"; 
          newProgress = 75; // Arbitrary progress for processing
          shouldUpdateQueue = true;
        }
      } else if (upload.status === "errored" || upload.status === "cancelled") {
        newStatus = "failed";
        shouldUpdateQueue = true;
        await setUploadError(
          queueItem.id,
          upload.status === "errored" ? "Upload failed on Mux" : "Upload was cancelled",
          false // Don't increment retry for external failures
        );
      }

      // Update queue item if status changed
      if (shouldUpdateQueue && (
        newStatus !== queueItem.uploadStatus || 
        newProgress !== queueItem.uploadProgress ||
        upload.asset_id !== queueItem.muxAssetId
      )) {
        console.log(`Updating queue item ${queueItem.id}: ${queueItem.uploadStatus} -> ${newStatus} (${newProgress}%)`);
        
        await updateUploadQueueItem(queueItem.id, {
          uploadStatus: newStatus,
          uploadProgress: newProgress,
          muxAssetId: upload.asset_id || queueItem.muxAssetId,
          muxPlaybackId: playbackId || queueItem.muxPlaybackId,
          completedAt: newStatus === "completed" || newStatus === "failed" ? new Date() : null,
        });

        // If upload is completed, start AI extraction process
        if (newStatus === "completed" && queueItem.aiExtractionStatus === "pending") {
          console.log(`Starting AI extraction for queue item ${queueItem.id}`);
          await this.startAiExtraction(queueItem.id);
        }
      }

    } catch (error) {
      console.error(`Error processing upload ${queueItem.id}:`, error);
      
      // Mark as failed if we exceed retry count
      if (queueItem.retryCount >= queueItem.maxRetries) {
        await setUploadError(
          queueItem.id,
          `Failed after ${queueItem.maxRetries} retries: ${error instanceof Error ? error.message : 'Unknown error'}`,
          false
        );
      } else {
        // Increment retry count
        await setUploadError(
          queueItem.id,
          error instanceof Error ? error.message : 'Unknown error',
          true
        );
      }
    }
  }

  private async startAiExtraction(queueItemId: string): Promise<void> {
    try {
      // Update AI extraction status to indicate it's started
      await updateAiExtractionProgress(queueItemId, 0, "processing");
      
      // TODO: Implement actual AI extraction logic here
      // This would integrate with the existing extractClassData pipeline
      
      console.log(`AI extraction started for queue item ${queueItemId}`);
      
      // For now, just simulate progress
      // In a real implementation, this would trigger the AI extraction process
      // and update progress as it goes
      
    } catch (error) {
      console.error(`Error starting AI extraction for ${queueItemId}:`, error);
      await updateAiExtractionProgress(queueItemId, 0, "failed");
    }
  }

  /**
   * Process a single upload by ID (useful for manual triggers)
   */
  public async processUploadById(queueItemId: string): Promise<void> {
    try {
      const queueItem = await getUploadQueueItem(queueItemId);
      if (!queueItem) {
        throw new Error(`Queue item ${queueItemId} not found`);
      }
      
      await this.processUpload(queueItem);
    } catch (error) {
      console.error(`Error processing upload ${queueItemId}:`, error);
      throw error;
    }
  }

  /**
   * Process a single upload by Mux upload ID
   */
  public async processUploadByMuxId(muxUploadId: string): Promise<void> {
    try {
      const queueItem = await getUploadQueueItemByMuxUploadId(muxUploadId);
      if (!queueItem) {
        throw new Error(`Queue item with Mux ID ${muxUploadId} not found`);
      }
      
      await this.processUpload(queueItem);
    } catch (error) {
      console.error(`Error processing upload with Mux ID ${muxUploadId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const uploadQueuePoller = UploadQueuePoller.getInstance();

// Helper functions for server-side usage
export const startUploadPoller = () => uploadQueuePoller.start();
export const stopUploadPoller = () => uploadQueuePoller.stop();
export const isUploadPollerRunning = () => uploadQueuePoller.isRunning();