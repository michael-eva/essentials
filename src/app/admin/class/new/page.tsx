"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { VideoUploader } from "./_components/VideoUploader";
import { ClassDataExtractor } from "./_components/ClassDataExtractor";
import { CheckCircle, Upload, MessageSquare, ArrowRight, Save, Clock } from "lucide-react";
import { toast } from "sonner";
import { 
  getFromLocalStorage, 
  saveToLocalStorage, 
  clearLocalStorage, 
  isLocalStorageAvailable,
  type LocalDraftData 
} from "./_utils/localStorage";

interface ClassData {
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
  tags: string;
  exerciseSequence: string;
  instructor: string;
  muxPlaybackId?: string;
  muxAssetId?: string;
}

export default function NewClassPage() {
  const [step, setStep] = useState<"upload" | "complete">("upload");
  const [videoData, setVideoData] = useState<{
    playbackId?: string;
    assetId: string;
  } | null>(null);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [chatHistory, setChatHistory] = useState<Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>>([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [hasLocalStorage, setHasLocalStorage] = useState<boolean | null>(null);
  

  // Check localStorage availability on mount
  useEffect(() => {
    setHasLocalStorage(isLocalStorageAvailable());
  }, []);

  // Load draft data on component mount (prioritize localStorage, fallback to database)
  const { data: draftData } = api.admin.loadDraft.useQuery(
    { sessionId },
    { 
      enabled: !!sessionId && (hasLocalStorage === false || hasLocalStorage === null), // Query DB if localStorage unavailable or unknown
      staleTime: 60000 // Cache for 1 minute
    }
  );
  
  // Save draft mutation (only used for manual saves now)
  const saveDraftMutation = api.admin.saveDraft.useMutation({
    onSuccess: () => {
      setIsSavingDraft(false);
      setLastSaveTime(new Date());
      toast.success("Draft saved to database - Available across all your devices.");
    },
    onError: () => {
      setIsSavingDraft(false);
      toast.error("Database save failed - Your local data is still safe. Please try again to sync across devices.");
    },
  });
  
  // Delete draft mutation
  const deleteDraftMutation = api.admin.deleteDraft.useMutation();
  
  // Simple restoration on mount - run once only
  const hasRestoredRef = useRef(false);
  
  useEffect(() => {
    if (hasRestoredRef.current) return; // Already restored, don't run again
    if (hasLocalStorage === null) return; // Wait for localStorage availability check
    
    // Try localStorage first if available
    if (hasLocalStorage === true) {
      const localData = getFromLocalStorage();
      if (localData) {
        let restored = false;
        
        if (localData.videoData && !videoData) {
          setVideoData(localData.videoData);
          restored = true;
        }
        if (localData.classData && !classData) {
          setClassData(localData.classData);
          restored = true;
        }
        if (localData.chatHistory && localData.chatHistory.length > 0 && chatHistory.length === 0) {
          setChatHistory(localData.chatHistory);
          restored = true;
        }
        
        if (restored) {
          hasRestoredRef.current = true;
          toast.success("Draft restored from browser storage");
          return;
        }
      }
    }
    
    // Fallback to database if localStorage had no data or not available
    if (draftData && !hasRestoredRef.current) {
      let restored = false;
      
      if ((draftData.muxAssetId || draftData.muxPlaybackId) && !videoData) {
        setVideoData({
          assetId: draftData.muxAssetId || '',
          playbackId: draftData.muxPlaybackId || undefined,
        });
        restored = true;
      }
      if (draftData.extractedData && !classData) {
        setClassData(draftData.extractedData as ClassData);
        restored = true;
      }
      if (draftData.chatHistory && draftData.chatHistory.length > 0 && chatHistory.length === 0) {
        setChatHistory(draftData.chatHistory);
        restored = true;
      }
      
      if (restored) {
        hasRestoredRef.current = true;
        toast.success("Draft restored from database");
      }
    }
  }, [hasLocalStorage, draftData, videoData, classData, chatHistory]);

  // Warn user before leaving page if there's unsaved progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (videoData || classData || chatHistory.length > 0) {
        e.preventDefault();
        e.returnValue = "You have unsaved progress. Are you sure you want to leave?";
        return "You have unsaved progress. Are you sure you want to leave?";
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [videoData, classData, chatHistory]);
  
  // Simple auto-save to localStorage only
  useEffect(() => {
    // Only save if we have localStorage and actual data
    if (hasLocalStorage === true && (videoData || classData || chatHistory.length > 0)) {
      // Use a longer timeout to prevent excessive saves
      const timer = setTimeout(() => {
        try {
          saveToLocalStorage({
            sessionId,
            videoData: videoData || undefined,
            classData: classData || undefined,
            chatHistory,
          });
          console.log('Saved to localStorage:', { videoData: !!videoData, classData: !!classData, chatLength: chatHistory.length });
        } catch (error) {
          console.error('Failed to save to localStorage:', error);
        }
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [hasLocalStorage, videoData, classData, chatHistory, sessionId]);

  // Manual save to database only
  const handleSaveDraft = useCallback(() => {
    if (!videoData && !classData && chatHistory.length === 0) {
      toast.error("No data to save");
      return;
    }

    setIsSavingDraft(true);
    
    // Save to database only (localStorage auto-saves separately)
    saveDraftMutation.mutate({
      sessionId,
      muxAssetId: videoData?.assetId,
      muxPlaybackId: videoData?.playbackId,
      chatHistory,
      extractedData: classData || undefined,
    });
  }, [videoData, classData, chatHistory, sessionId, saveDraftMutation]);

  const createClassMutation = api.admin.createPilatesVideo.useMutation({
    onSuccess: () => {
      // Clear localStorage immediately
      if (hasLocalStorage === true) {
        clearLocalStorage();
      }
      
      // Delete database draft
      deleteDraftMutation.mutate({ sessionId });
      
      setStep("complete");
      setIsSubmitting(false);
      toast.success("Class created successfully - Your pilates class has been uploaded and is now available.");
    },
    onError: (error) => {
      console.error("Error creating class:", error);
      setIsSubmitting(false);
      toast.error("Creation failed - Failed to create the class. Please try again.");
    },
  });

  const handleVideoUpload = (uploadData: { playbackId?: string; assetId: string }) => {
    setVideoData(uploadData);
  };

  const handleDataExtracted = (extractedData: ClassData) => {
    const newData = {
      ...extractedData,
      muxPlaybackId: videoData?.playbackId,
      muxAssetId: videoData?.assetId,
    };
    setClassData(newData);
  };
  
  const handleChatUpdate = useCallback((newChatHistory: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>) => {
    const serializedHistory = newChatHistory.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    }));
    
    // Only update if the chat actually changed to prevent loops
    setChatHistory(prev => {
      if (JSON.stringify(prev) === JSON.stringify(serializedHistory)) {
        return prev; // No change, return same reference to prevent re-render
      }
      return serializedHistory;
    });
  }, []);
  

  const handleSubmit = async () => {
    if (!classData) return;
    setIsSubmitting(true);
    createClassMutation.mutate(classData);
  };

  const handleStartOver = () => {
    // Clear localStorage
    if (hasLocalStorage === true) {
      clearLocalStorage();
    }
    
    setStep("upload");
    setVideoData(null);
    setClassData(null);
    setChatHistory([]);
    setLastSaveTime(null);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-light text-slate-800 mb-3">New Class</h1>
          <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full" />
        </header>

        {/* Progress */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step === "upload" ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                {step === "complete" ? "✓" : "1"}
              </div>
              <span className={`text-sm font-medium ${step === "upload" ? "text-slate-900" : "text-slate-500"}`}>
                Upload
              </span>
            </div>

            <div className="w-12 h-0.5 bg-slate-300" />

            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step === "complete" ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                2
              </div>
              <span className={`text-sm font-medium ${step === "complete" ? "text-slate-900" : "text-slate-500"}`}>
                Review
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {step === "upload" && (
          <div className="space-y-8">
            {/* Video Section */}
            <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Upload Video</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Select your pilates class video file. Supported formats: MP4, MOV, AVI, MKV, WMV (max 2GB).
                  </p>
                </div>
              </div>
              <VideoUploader 
                onUploadComplete={handleVideoUpload} 
                existingVideoData={videoData || undefined}
                sessionId={sessionId}
              />
            </section>

            {/* Class Info Section */}
            <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <div className="flex items-start space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Class Information</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Paste any information about your class. Our AI will extract and organize the details automatically.
                  </p>
                </div>
              </div>
              <ClassDataExtractor
                onDataExtracted={handleDataExtracted}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                extractedData={classData}
                onChatUpdate={handleChatUpdate}
                initialChatHistory={chatHistory}
              />
            </section>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              {/* Save Draft Button and Status */}
              <div className="flex flex-col items-start">
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleSaveDraft}
                    variant="outline"
                    disabled={isSavingDraft || (!videoData && !classData && chatHistory.length === 0)}
                    className="flex items-center space-x-2"
                  >
                    {isSavingDraft ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save to Database</span>
                      </>
                    )}
                  </Button>
                  {lastSaveTime && !isSavingDraft && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        Last synced {lastSaveTime.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} (database)
                      </span>
                    </div>
                  )}
                </div>
                {(videoData || classData || chatHistory.length > 0) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {hasLocalStorage === true 
                      ? "Auto-saves to your browser • Click to sync to database"
                      : "Click to save your progress to database"}
                  </p>
                )}
              </div>
              
              {/* Create Class Button */}
              {classData && videoData && (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="lg"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Class...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Create Class</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {step === "complete" && (
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Class Created Successfully</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Your pilates class &quot;{classData?.title}&quot; has been uploaded and is now available in the system.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleStartOver}
                variant="outline"
                size="lg"
                className="px-6 py-3 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Upload Another Class
              </Button>
              <Button
                asChild
                size="lg"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white"
              >
                <a href="/admin">Back to Admin</a>
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}