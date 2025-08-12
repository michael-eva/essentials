"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VideoUploader } from "./_components/VideoUploader";
import { ClassDataExtractor } from "./_components/ClassDataExtractor";
import { Loader2, CheckCircle, Upload, MessageSquare } from "lucide-react";

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
  const [step, setStep] = useState<"upload" | "extract" | "complete">("upload");
  const [videoData, setVideoData] = useState<{
    playbackId: string;
    assetId: string;
  } | null>(null);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleVideoUpload = (uploadData: { playbackId: string; assetId: string }) => {
    setVideoData(uploadData);
    setStep("extract");
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload New Class</h1>
        <p className="mt-2 text-gray-600">
          Upload a video and use AI to extract class information automatically.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${
            step === "upload" ? "text-blue-600" : step !== "upload" ? "text-green-600" : "text-gray-400"
          }`}>
            <div className={`rounded-full p-2 ${
              step === "upload" ? "bg-blue-100" : step !== "upload" ? "bg-green-100" : "bg-gray-100"
            }`}>
              {step !== "upload" ? <CheckCircle className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            </div>
            <span className="text-sm font-medium">Upload Video</span>
          </div>
          
          <div className={`h-px flex-1 ${
            step !== "upload" ? "bg-green-300" : "bg-gray-300"
          }`} />
          
          <div className={`flex items-center space-x-2 ${
            step === "extract" ? "text-blue-600" : step === "complete" ? "text-green-600" : "text-gray-400"
          }`}>
            <div className={`rounded-full p-2 ${
              step === "extract" ? "bg-blue-100" : step === "complete" ? "bg-green-100" : "bg-gray-100"
            }`}>
              {step === "complete" ? <CheckCircle className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            </div>
            <span className="text-sm font-medium">Extract Data</span>
          </div>
          
          <div className={`h-px flex-1 ${
            step === "complete" ? "bg-green-300" : "bg-gray-300"
          }`} />
          
          <div className={`flex items-center space-x-2 ${
            step === "complete" ? "text-green-600" : "text-gray-400"
          }`}>
            <div className={`rounded-full p-2 ${
              step === "complete" ? "bg-green-100" : "bg-gray-100"
            }`}>
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Complete</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Video to Mux</span>
            </CardTitle>
            <CardDescription>
              Select and upload your pilates class video. It will be processed and made ready for streaming.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoUploader onUploadComplete={handleVideoUpload} />
          </CardContent>
        </Card>
      )}

      {step === "extract" && videoData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Extract Class Information</span>
            </CardTitle>
            <CardDescription>
              Paste information about your class and let AI organize it into the required format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClassDataExtractor 
              onDataExtracted={handleDataExtracted}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              extractedData={classData}
            />
          </CardContent>
        </Card>
      )}

      {step === "complete" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>Class Created Successfully!</span>
            </CardTitle>
            <CardDescription>
              Your pilates class has been uploaded and is now available in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Class "{classData?.title}" has been successfully created with video ID: {videoData?.playbackId}
              </AlertDescription>
            </Alert>
            
            <div className="flex space-x-4">
              <Button onClick={handleStartOver} variant="outline">
                Upload Another Class
              </Button>
              <Button asChild>
                <a href="/admin">Back to Admin Dashboard</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}