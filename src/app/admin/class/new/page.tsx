"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { VideoUploader } from "./_components/VideoUploader";
import { ClassDataExtractor } from "./_components/ClassDataExtractor";
import { CheckCircle, Upload, MessageSquare, ArrowRight } from "lucide-react";

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

  // Clear any cached state on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear any localStorage or sessionStorage that might be causing issues
      sessionStorage.removeItem('newClassPageState');
      localStorage.removeItem('newClassPageState');
    }
  }, []);

  const createClassMutation = api.admin.createPilatesVideo.useMutation({
    onSuccess: () => {
      setStep("complete");
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Error creating class:", error);
      setIsSubmitting(false);
    },
  });

  const handleVideoUpload = (uploadData: { playbackId?: string; assetId: string }) => {
    setVideoData(uploadData);
  };

  const handleDataExtracted = (extractedData: ClassData) => {
    setClassData({
      ...extractedData,
      muxPlaybackId: videoData?.playbackId,
      muxAssetId: videoData?.assetId,
    });
  };

  const handleSubmit = async () => {
    if (!classData) return;
    setIsSubmitting(true);
    createClassMutation.mutate(classData);
  };

  const handleStartOver = () => {
    setStep("upload");
    setVideoData(null);
    setClassData(null);
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
              <VideoUploader onUploadComplete={handleVideoUpload} />
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
              />
            </section>

            {/* Action Button */}
            {classData && videoData && (
              <div className="text-center pt-4">
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
              </div>
            )}
          </div>
        )}

        {step === "complete" && (
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Class Created Successfully</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Your pilates class "{classData?.title}" has been uploaded and is now available in the system.
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