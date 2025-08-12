"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";

interface VideoUploaderProps {
  onUploadComplete: (data: { uploadId: string; assetId: string; playbackId: string }) => void;
}

type UploadState = "idle" | "uploading" | "processing" | "completed" | "error";

export default function VideoUploader({ onUploadComplete }: VideoUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);

  // Get upload URL from tRPC
  const createUploadUrl = api.admin.createUploadUrl.useQuery(
    undefined,
    { enabled: false }
  );

  // Get upload status
  const getUploadStatus = api.admin.getUploadStatus.useQuery(
    { uploadId: currentUploadId! },
    { 
      enabled: !!currentUploadId && uploadState === "processing",
      refetchInterval: 2000,
    }
  );

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime"];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid video file (MP4, MOV, AVI)");
        return;
      }

      // Validate file size (max 2GB)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        setError("File size must be less than 2GB");
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Create a fake input event to reuse validation logic
      const fakeEvent = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  }, [handleFileSelect]);

  // Upload to Mux
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadState("uploading");
      setError(null);

      // Get upload URL
      const uploadUrlData = await createUploadUrl.refetch();
      if (!uploadUrlData.data) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, uploadId } = uploadUrlData.data;
      setCurrentUploadId(uploadId);

      // Upload file to Mux
      const formData = new FormData();
      formData.append("file", selectedFile);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.onload = function() {
        if (xhr.status === 200) {
          setUploadState("processing");
          setUploadProgress(100);
        } else {
          throw new Error("Upload failed");
        }
      };

      xhr.onerror = function() {
        throw new Error("Upload failed");
      };

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", selectedFile.type);
      xhr.send(selectedFile);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploadState("error");
    }
  };

  // Check processing status
  React.useEffect(() => {
    if (getUploadStatus.data) {
      const { status, assetId, playbackId, assetStatus } = getUploadStatus.data;
      
      if (status === "asset_created" && assetId && playbackId && assetStatus === "ready") {
        setUploadState("completed");
        onUploadComplete({
          uploadId: currentUploadId!,
          assetId,
          playbackId,
        });
      } else if (assetStatus === "preparing") {
        // Update processing progress based on asset status
        setProcessingProgress(50);
      } else if (assetStatus === "ready") {
        setProcessingProgress(100);
      }
    }
  }, [getUploadStatus.data, currentUploadId, onUploadComplete]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Video Upload</span>
        </CardTitle>
        <CardDescription>
          Upload your pilates class video to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadState === "idle" && (
          <>
            {/* File Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Drop your video here</p>
                <p className="text-sm text-gray-500">or click to select a file</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload">
                  <Button variant="outline" className="mt-4">
                    Select Video File
                  </Button>
                </label>
              </div>
            </div>

            {selectedFile && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <Button onClick={handleUpload} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload to Mux
                </Button>
              </div>
            )}
          </>
        )}

        {uploadState === "uploading" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Uploading video...</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-gray-500">
              {selectedFile?.name} - {uploadProgress.toFixed(0)}% complete
            </p>
          </div>
        )}

        {uploadState === "processing" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing video...</span>
            </div>
            <Progress value={processingProgress} className="w-full" />
            <p className="text-sm text-gray-500">
              Mux is processing your video for streaming. This may take a few minutes.
            </p>
          </div>
        )}

        {uploadState === "completed" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Upload completed successfully!</span>
            </div>
            <p className="text-sm text-gray-500">
              Your video is ready. Proceed to the next step to extract class information.
            </p>
          </div>
        )}

        {uploadState === "error" && error && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Upload failed</span>
            </div>
            <p className="text-sm text-red-600">{error}</p>
            <Button
              variant="outline"
              onClick={() => {
                setUploadState("idle");
                setError(null);
                setUploadProgress(0);
                setProcessingProgress(0);
              }}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}