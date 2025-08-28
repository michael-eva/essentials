/**
 * localStorage utilities for admin class creation persistence
 */

const STORAGE_KEY = "admin_class_new_draft";

export interface VideoData {
  playbackId?: string;
  assetId: string;
}

export interface ClassData {
  title: string;
  summary: string;
  description: string;
  difficulty: string;
  duration: number;
  equipment: string;
  pilatesStyle: string;
  classType: string;
  focusArea: string;
  targetedMuscles: string;
  intensity: number;
  modifications: boolean;
  beginnerFriendly: boolean;
  tags: string[];
  exerciseSequence: string[];
  instructor: string;
  muxPlaybackId?: string;
  muxAssetId?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface LocalDraftData {
  sessionId: string;
  videoData?: VideoData;
  classData?: ClassData;
  chatHistory: ChatMessage[];
  lastSaved: string;
  version: number; // For future compatibility
}

/**
 * Save draft data to localStorage
 */
export const saveToLocalStorage = (data: Partial<LocalDraftData>): void => {
  try {
    const existing = getFromLocalStorage();
    const updated: LocalDraftData = {
      sessionId:
        existing?.sessionId || data.sessionId || `session_${Date.now()}`,
      videoData: data.videoData || existing?.videoData,
      classData: data.classData || existing?.classData,
      chatHistory: data.chatHistory || existing?.chatHistory || [],
      lastSaved: new Date().toISOString(),
      version: 1,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log("Draft saved to localStorage:", {
      sessionId: updated.sessionId,
      videoData: updated.videoData,
      classData: updated.classData,
      muxData: updated.videoData
        ? {
            assetId: updated.videoData.assetId,
            playbackId: updated.videoData.playbackId,
          }
        : null,
    });
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
};

/**
 * Load draft data from localStorage
 */
export const getFromLocalStorage = (): LocalDraftData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as LocalDraftData;

    // Check if data is recent (within 7 days)
    const lastSaved = new Date(data.lastSaved);
    const daysSinceLastSaved =
      (Date.now() - lastSaved.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastSaved > 7) {
      console.log("Draft data is older than 7 days, clearing...");
      clearLocalStorage();
      return null;
    }

    console.log("Draft loaded from localStorage:", {
      sessionId: data.sessionId,
      videoData: data.videoData,
      classData: data.classData,
      muxData: data.videoData
        ? {
            assetId: data.videoData.assetId,
            playbackId: data.videoData.playbackId,
          }
        : null,
    });
    return data;
  } catch (error) {
    console.warn("Failed to load from localStorage:", error);
    return null;
  }
};

/**
 * Clear draft data from localStorage
 */
export const clearLocalStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("Draft cleared from localStorage");
  } catch (error) {
    console.warn("Failed to clear localStorage:", error);
  }
};

/**
 * Update only video data in localStorage
 */
export const saveVideoToLocalStorage = (videoData: VideoData): void => {
  console.log("Saving video data to localStorage:", videoData);
  saveToLocalStorage({ videoData });
};

/**
 * Update only class data in localStorage
 */
export const saveClassDataToLocalStorage = (classData: ClassData): void => {
  saveToLocalStorage({ classData });
};

/**
 * Update only chat history in localStorage
 */
export const saveChatToLocalStorage = (chatHistory: ChatMessage[]): void => {
  saveToLocalStorage({ chatHistory });
};

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};
