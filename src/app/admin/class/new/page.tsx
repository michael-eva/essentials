"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { VideoUploader } from "./_components/VideoUploader";
import { ClassDataExtractor } from "./_components/ClassDataExtractor";
import { CheckCircle, Upload, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  getFromLocalStorage,
  saveToLocalStorage,
  clearLocalStorage,
  isLocalStorageAvailable,
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
  tags: string[];
  exerciseSequence: string[];
  instructor: string;
  muxPlaybackId?: string;
  muxAssetId?: string;
}

export default function NewClassPage() {
  const router = useRouter();
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
  const [isUploading, setIsUploading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const hasData = !!(videoData || classData || chatHistory.length > 0);

  // Check localStorage availability on mount
  useEffect(() => {
    setHasLocalStorage(isLocalStorageAvailable());
  }, []);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = !!(videoData || classData || chatHistory.length > 0);
    setHasUnsavedChanges(hasChanges);
  }, [videoData, classData, chatHistory]);

  // Enhanced navigation warning system
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || isUploading) {
        const message = isUploading
          ? "Upload in progress. Don't leave this page."
          : "Unsaved changes will be lost.";

        e.preventDefault();
        return message;
      }
    };

    // Handle Next.js navigation attempts
    const handleRouteChangeStart = () => {
      if (hasUnsavedChanges || isUploading) {
        const message = isUploading
          ? "Upload in progress. Navigate away?"
          : "Unsaved changes. Navigate away?";

        if (!window.confirm(message)) {
          // Prevent navigation by returning false
          return false;
        }
      }
      return true;
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Override router.push to add navigation guard
    const originalPush = router.push;
    router.push = (href: string, options?: any) => {
      if (handleRouteChangeStart()) {
        return originalPush.call(router, href, options);
      }
      return Promise.resolve(false);
    };

    // Override router.back and router.forward
    const originalBack = router.back;
    const originalForward = router.forward;

    router.back = () => {
      if (handleRouteChangeStart()) {
        return originalBack.call(router);
      }
      return Promise.resolve(false);
    };

    router.forward = () => {
      if (handleRouteChangeStart()) {
        return originalForward.call(router);
      }
      return Promise.resolve(false);
    };

    // Handle popstate (browser back/forward buttons)
    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedChanges || isUploading) {
        const message = isUploading
          ? "Upload in progress. Navigate away?"
          : "Unsaved changes. Navigate away?";

        if (!window.confirm(message)) {
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.href);
          return;
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Global click handler to catch all navigation attempts
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]');

      if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && href !== window.location.pathname) {
          if (!handleRouteChangeStart()) {
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        }
      }
    };

    // Use capture phase to catch events early
    document.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick, true);
      // Restore original router methods
      router.push = originalPush;
      router.back = originalBack;
      router.forward = originalForward;
    };
  }, [hasUnsavedChanges, isUploading, router]);

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
      toast.success("Draft saved.");
    },
    onError: () => {
      setIsSavingDraft(false);
      toast.error("Save failed. Try again.");
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
          toast.success("Draft restored");
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
        setClassData(draftData.extractedData as unknown as ClassData);
        restored = true;
      }
      if (draftData.chatHistory && draftData.chatHistory.length > 0 && chatHistory.length === 0) {
        setChatHistory(draftData.chatHistory);
        restored = true;
      }

      if (restored) {
        hasRestoredRef.current = true;
        toast.success("Draft restored");
      }
    }
  }, [hasLocalStorage, draftData, videoData, classData, chatHistory]);

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
      toast.success("Class created successfully.");
    },
    onError: (error) => {
      console.error("Error creating class:", error);
      setIsSubmitting(false);
      toast.error("Creation failed. Try again.");
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

    // Check if there are unsaved changes that haven't been synced to database
    if (hasUnsavedChanges && !lastSaveTime) {
      const shouldContinue = window.confirm(
        "Unsaved changes haven't been synced. Continue anyway?"
      );

      if (!shouldContinue) {
        return;
      }

    }

    setIsSubmitting(true);
    createClassMutation.mutate(classData);
  };

  const handleStartOver = () => {
    // Show confirmation dialog


    if (hasData) {
      const confirmReset = window.confirm(
        "Are you sure you want to reset the form? This will clear all uploaded data, form inputs, and chat history. This action cannot be undone."
      );

      if (!confirmReset) {
        return; // User cancelled the reset
      }
    }

    // Clear localStorage
    if (hasLocalStorage === true) {
      clearLocalStorage();
    }

    // TODO: Remove video from Mux if videoData exists
    // This prevents orphaned video assets when users reset the form
    // Need to implement: api.admin.deleteVideo.mutate({ assetId: videoData?.assetId })

    setStep("upload");
    setVideoData(null);
    setClassData(null);
    setChatHistory([]);
    setLastSaveTime(null);
    setIsSubmitting(false);
    setResetKey(prev => prev + 1); // Force re-render of VideoUploader

    toast.success("Form reset successfully");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-light text-slate-800 mb-3">New Class</h1>
          <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full" />

          {/* Reset Button */}
          {hasData && <div className="mt-4 flex justify-center">
            <Button
              onClick={handleStartOver}
              size="sm"
              className="bg-red-400"
            >
              Reset Form
            </Button>
          </div>}

          {isUploading && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">
                Upload in progress. Don't refresh or navigate away.
              </p>
            </div>
          )}
          {hasUnsavedChanges && !isUploading && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                Unsaved changes. Auto-saved locally.
              </p>
            </div>
          )}
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
                Complete
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
                    Select your video file (MP4, MOV, AVI, MKV, WMV - max 2GB).
                  </p>
                </div>
              </div>
              <VideoUploader
                key={resetKey} // Add key to force re-render
                onUploadComplete={handleVideoUpload}
                onUploadStateChange={setIsUploading}
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
                    Paste class details. AI will extract and organize automatically.
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
                onSaveDraft={handleSaveDraft}
                isSavingDraft={isSavingDraft}
                videoData={videoData}
                lastSaveTime={lastSaveTime}
              />
            </section>


          </div>
        )}

        {step === "complete" && (
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Class Created</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              &quot;{classData?.title}&quot; is now available.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleStartOver}
                variant="outline"
                size="lg"
                className="px-6 py-3 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                New Class
              </Button>
              <Button
                asChild
                size="lg"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white"
              >
                <a href="/admin">Admin</a>
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}