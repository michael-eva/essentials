"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { ArrowLeft, Upload, MessageCircle, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import VideoUploader from "./VideoUploader";
import ClassDataExtractor from "./ClassDataExtractor";
import { api } from "~/trpc/react";
import { toast } from "sonner";

type UploadStep = "upload" | "extract" | "review";

interface UploadData {
  uploadId: string;
  assetId: string;
  playbackId: string;
}

interface ExtractedData {
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
}

export default function NewClassPage() {
  const [currentStep, setCurrentStep] = useState<UploadStep>("upload");
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Insert pilates video mutation
  const insertPilatesVideo = api.admin.insertPilatesVideo.useMutation({
    onSuccess: () => {
      toast.success("Class saved successfully!");
      // Reset form or redirect
      setCurrentStep("upload");
      setUploadData(null);
      setExtractedData(null);
    },
    onError: (error) => {
      toast.error(`Failed to save class: ${error.message}`);
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const steps = [
    { id: "upload", title: "Upload Video", icon: Upload },
    { id: "extract", title: "Extract Data", icon: MessageCircle },
    { id: "review", title: "Review & Save", icon: Save },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleUploadComplete = (data: UploadData) => {
    setUploadData(data);
    setCurrentStep("extract");
  };

  const handleDataExtracted = (data: ExtractedData) => {
    setExtractedData(data);
    setCurrentStep("review");
  };

  const handleSave = async () => {
    if (!uploadData || !extractedData) return;
    
    setIsSaving(true);
    insertPilatesVideo.mutate({
      ...extractedData,
      muxAssetId: uploadData.assetId,
      muxPlaybackId: uploadData.playbackId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Upload New Class</h2>
            <p className="text-muted-foreground">
              Upload a video and let AI extract the class information
            </p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Progress</CardTitle>
          <CardDescription>
            Step {currentStepIndex + 1} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-2 ${
                      isActive
                        ? "text-blue-600"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <StepIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === "upload" && (
        <VideoUploader onUploadComplete={handleUploadComplete} />
      )}

      {currentStep === "extract" && uploadData && (
        <ClassDataExtractor
          uploadData={uploadData}
          onDataExtracted={handleDataExtracted}
        />
      )}

      {currentStep === "review" && uploadData && extractedData && (
        <Card>
          <CardHeader>
            <CardTitle>Review Class Information</CardTitle>
            <CardDescription>
              Review the extracted data and save the class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <p className="text-sm text-gray-600">{extractedData.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Instructor</label>
                  <p className="text-sm text-gray-600">{extractedData.instructor}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <p className="text-sm text-gray-600">{extractedData.duration} minutes</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <p className="text-sm text-gray-600">{extractedData.difficulty}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-gray-600">{extractedData.description}</p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("extract")}
                >
                  Back to Edit
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Class
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}