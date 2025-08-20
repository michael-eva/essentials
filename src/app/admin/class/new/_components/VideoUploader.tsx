"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileVideo, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { saveVideoToLocalStorage, getFromLocalStorage } from "../_utils/localStorage";

interface VideoUploaderProps {
  onUploadComplete: (data: { playbackId?: string; assetId: string }) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  existingVideoData?: { playbackId?: string; assetId: string };
  sessionId: string;
}

export function VideoUploader({ onUploadComplete, onUploadStateChange, existingVideoData, sessionId }: VideoUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "complete" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [restoredVideoData, setRestoredVideoData] = useState<{ playbackId?: string; assetId: string } | null>(null);

  // Notify parent of upload state changes
  useEffect(() => {
    if (onUploadStateChange) {
      onUploadStateChange(uploadStatus === "uploading" || uploadStatus === "processing");
    }
  }, [uploadStatus, onUploadStateChange]);

  // Restore existing video data on mount (prioritize props, then localStorage)
  useEffect(() => {
    if (existingVideoData && !restoredVideoData) {
      setRestoredVideoData(existingVideoData);
      setUploadStatus("complete");
      // Notify parent of restored data
      onUploadComplete(existingVideoData);
    } else if (!existingVideoData && !restoredVideoData) {
      // Try to restore from localStorage if no props provided
      const localData = getFromLocalStorage();
      if (localData?.videoData) {
        setRestoredVideoData(localData.videoData);
        setUploadStatus("complete");
        onUploadComplete(localData.videoData);
      }
    }
  }, [existingVideoData, restoredVideoData, onUploadComplete]);

  const uploadVideoMutation = api.admin.uploadVideo.useMutation({
    onError: (error) => {
      setUploadStatus("error");
      setErrorMessage(`Failed to start upload: ${error.message}`);
      console.error("Upload initialization error:", error);
    },
  });

  const checkUploadStatusMutation = api.admin.getUploadStatus.useMutation();

  const pollUploadStatus = async (uploadId: string) => {
    const maxAttempts = 60; // 10 minutes max (60 * 10 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        const status = await checkUploadStatusMutation.mutateAsync({ uploadId });

        console.log("Upload status check:", status);

        // If upload completed and asset is ready
        if (status.uploadStatus === "asset_created" && status.assetStatus === "ready") {
          setUploadStatus("complete");
          const videoData = {
            assetId: status.assetId!,
            playbackId: status.playbackId || undefined
          };

          // Save to localStorage immediately
          saveVideoToLocalStorage(videoData);

          // Notify parent
          onUploadComplete(videoData);
        }
        // If upload failed
        else if (status.uploadStatus === "errored" || status.assetStatus === "errored") {
          setUploadStatus("error");
          setErrorMessage("Video processing failed. Please try uploading again or contact support if the issue persists.");
        }
        // If upload timed out
        else if (status.uploadStatus === "timed_out") {
          setUploadStatus("error");
          setErrorMessage("Upload timed out. This may be due to a slow internet connection. Please check your connection and try again.");
        }
        // If upload cancelled
        else if (status.uploadStatus === "cancelled") {
          setUploadStatus("error");
          setErrorMessage("Upload was cancelled. Please try uploading your video again.");
        }
        // Continue polling if still processing
        else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(() => void poll(), 10000); // Check every 10 seconds
        } else {
          setUploadStatus("error");
          setErrorMessage("Upload processing timed out after 10 minutes. The video may still be processing in the background. Please refresh the page in a few minutes to check status.");
        }
      } catch (error) {
        console.error("Error checking upload status:", error);
        setUploadStatus("error");
        setErrorMessage("Failed to check upload status. Please refresh the page and try again.");
      }
    };

    poll();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file?.type.startsWith("video/")) {
      if (file.size <= 2 * 1024 * 1024 * 1024) { // 2GB limit
        setSelectedFile(file);
        setUploadStatus("idle");
        setErrorMessage(null);
      } else {
        setErrorMessage("File size must be less than 2GB");
        setUploadStatus("error");
      }
    } else {
      setErrorMessage("Please select a valid video file");
      setUploadStatus("error");
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file?.type.startsWith("video/")) {
      if (file.size <= 2 * 1024 * 1024 * 1024) { // 2GB limit
        setSelectedFile(file);
        setUploadStatus("idle");
        setErrorMessage(null);
      } else {
        setErrorMessage("File size must be less than 2GB");
        setUploadStatus("error");
      }
    } else {
      setErrorMessage("Please select a valid video file");
      setUploadStatus("error");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      console.log("Starting upload process for file:", selectedFile.name);

      // Create direct upload with Mux
      const uploadData = await uploadVideoMutation.mutateAsync({
        filename: selectedFile.name,
        contentType: selectedFile.type,
      });

      console.log("Received upload data from Mux:", uploadData);

      if (uploadData.uploadUrl) {
        console.log("Uploading file directly to Mux URL:", uploadData.uploadUrl);
        // Upload directly to Mux using the upload URL
        await uploadToMux(uploadData.uploadUrl, selectedFile, uploadData.uploadId);
      } else {
        throw new Error("No upload URL received from Mux");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to process file for upload");
    }
  };

  // Upload file directly to Mux using XMLHttpRequest for progress tracking
  const uploadToMux = async (uploadUrl: string, file: File, uploadId: string) => {
    return new Promise<void>((resolve, reject) => {
      console.log("Starting direct upload to Mux:", { uploadUrl, uploadId, fileSize: file.size });

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          console.log(`Upload progress: ${progress}%`);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        console.log("Upload response:", { status: xhr.status, statusText: xhr.statusText });

        if (xhr.status >= 200 && xhr.status < 300) {
          console.log("Upload successful, switching to processing status");
          setUploadStatus("processing");
          setUploadProgress(100);

          // Start polling upload status
          console.log("Starting status polling for upload:", uploadId);
          pollUploadStatus(uploadId);
          resolve();
        } else {
          console.error("Upload failed:", {
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText
          });
          setUploadStatus("error");
          setErrorMessage(`Upload failed: ${xhr.status} ${xhr.statusText}`);
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        console.error("Upload network error");
        setUploadStatus("error");
        setErrorMessage("Network error during upload");
        reject(new Error("Network error during upload"));
      };

      xhr.ontimeout = () => {
        console.error("Upload timeout");
        setUploadStatus("error");
        setErrorMessage("Upload timed out");
        reject(new Error("Upload timed out"));
      };

      // Open the request
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.timeout = 10 * 60 * 1000; // 10 minutes timeout

      // Send the file
      console.log("Sending file to Mux...");
      try {
        xhr.send(file);
      } catch (sendError) {
        console.error("Error sending file:", sendError);
        setUploadStatus("error");
        setErrorMessage("Failed to initiate file upload");
        reject(sendError instanceof Error ? sendError : new Error("Failed to initiate file upload"));
      }
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Restored Video Preview */}
      {restoredVideoData && uploadStatus === "complete" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-1">Video Already Uploaded</h3>
              <p className="text-green-700 mb-3">
                Your video has been successfully uploaded and processed. You can continue with class information or upload a different video.
              </p>
              {restoredVideoData.playbackId && (
                <div className="mt-4">
                  <img
                    src={`https://image.mux.com/${restoredVideoData.playbackId}/thumbnail.jpg?time=0&width=320&height=180&fit_mode=smartcrop`}
                    alt="Video thumbnail"
                    className="w-32 h-18 rounded border object-cover"
                  />
                </div>
              )}
            </div>
            <Button
              onClick={() => {
                setRestoredVideoData(null);
                setUploadStatus("idle");
                setSelectedFile(null);
              }}
              variant="outline"
              size="sm"
            >
              Upload Different Video
            </Button>
          </div>
        </div>
      )}

      {/* File Drop Zone - Only show if no restored video or user chose to upload different */}
      {!restoredVideoData && (
        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
              } ${uploadStatus !== "idle" && uploadStatus !== "error" ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              id="video-upload"
              disabled={uploadStatus !== "idle" && uploadStatus !== "error"}
            />
            <label htmlFor="video-upload" className="cursor-pointer block">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <Upload className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragOver ? "Drop your video here" : "Upload pilates class video"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Drag and drop your video file here, or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Supported formats: MP4, MOV, AVI, MKV, WMV (max 2GB)
                  </p>
                </div>
              </div>
            </label>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <FileVideo className="w-8 h-8 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
              {uploadStatus === "idle" && (
                <Button onClick={handleUpload} disabled={uploadVideoMutation.isPending}>
                  {uploadVideoMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload to Mux
                </Button>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {uploadStatus === "uploading" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading to Mux...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Processing Status */}
          {uploadStatus === "processing" && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Video uploaded successfully! Processing video for streaming... This may take a few minutes.
              </AlertDescription>
            </Alert>
          )}

          {/* Complete Status */}
          {uploadStatus === "complete" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Video processed successfully! Ready to proceed to the next step.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Status */}
          {uploadStatus === "error" && errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p>{errorMessage}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        setUploadStatus("idle");
                        setErrorMessage(null);
                        setSelectedFile(null);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Try Again
                    </Button>
                    {selectedFile && (
                      <Button
                        onClick={handleUpload}
                        variant="outline"
                        size="sm"
                      >
                        Retry Upload
                      </Button>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}