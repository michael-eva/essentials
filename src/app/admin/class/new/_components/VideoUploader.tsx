"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileVideo, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface VideoUploaderProps {
  onUploadComplete: (data: { playbackId: string; assetId: string }) => void;
}

export function VideoUploader({ onUploadComplete }: VideoUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "complete" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadVideoMutation = api.admin.uploadVideo.useMutation({
    onSuccess: (data) => {
      setUploadStatus("processing");
      // Poll for video processing status
      pollVideoStatus(data.assetId, data.playbackId);
    },
    onError: (error) => {
      setUploadStatus("error");
      setErrorMessage(error.message);
    },
  });

  const checkVideoStatusMutation = api.admin.getVideoStatus.useMutation();

  const pollVideoStatus = async (assetId: string, playbackId: string) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const status = await checkVideoStatusMutation.mutateAsync({ assetId });
        
        if (status.status === "ready") {
          setUploadStatus("complete");
          onUploadComplete({ assetId, playbackId });
        } else if (status.status === "errored") {
          setUploadStatus("error");
          setErrorMessage("Video processing failed");
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 10000); // Check every 10 seconds
        } else {
          setUploadStatus("error");
          setErrorMessage("Video processing timed out");
        }
      } catch (error) {
        setUploadStatus("error");
        setErrorMessage("Failed to check video status");
      }
    };

    poll();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
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
    if (file && file.type.startsWith("video/")) {
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
      // Convert file to base64 for upload
      const fileBuffer = await selectedFile.arrayBuffer();
      const base64 = Buffer.from(fileBuffer).toString("base64");

      uploadVideoMutation.mutate({
        filename: selectedFile.name,
        contentType: selectedFile.type,
        fileData: base64,
      });
    } catch (error) {
      setUploadStatus("error");
      setErrorMessage("Failed to process file for upload");
    }
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
      {/* File Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragOver
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
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}