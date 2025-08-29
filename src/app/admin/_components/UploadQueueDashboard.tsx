"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Upload, 
  Video, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Trash2,
  Pause,
  Play
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type UploadStatus = "pending" | "uploading" | "processing" | "completed" | "failed" | "cancelled";

interface UploadQueueItem {
  id: string;
  filename: string;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  aiExtractionStatus: UploadStatus;
  aiExtractionProgress: number;
  errorMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
  retryCount: number;
  maxRetries: number;
}

const getStatusIcon = (status: UploadStatus) => {
  switch (status) {
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case "uploading":
      return <Upload className="w-4 h-4 text-blue-500 animate-spin" />;
    case "processing":
      return <Video className="w-4 h-4 text-purple-500 animate-pulse" />;
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "failed":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "cancelled":
      return <Pause className="w-4 h-4 text-gray-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusBadgeVariant = (status: UploadStatus) => {
  switch (status) {
    case "pending":
      return "secondary";
    case "uploading":
      return "default";
    case "processing":
      return "default";
    case "completed":
      return "default" as const;
    case "failed":
      return "destructive";
    case "cancelled":
      return "secondary";
    default:
      return "secondary";
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export function UploadQueueDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Fetch upload queue
  const { 
    data: uploadQueue, 
    error: queueError, 
    refetch: refetchQueue,
    isLoading: isQueueLoading
  } = api.admin.getUploadQueue.useQuery(
    { limit: 20, offset: 0 },
    {
      refetchInterval: autoRefresh ? 5000 : false, // Refresh every 5 seconds if auto-refresh is on
      refetchIntervalInBackground: false,
    }
  );

  // Mutations
  const cancelUploadMutation = api.admin.cancelUpload.useMutation({
    onSuccess: () => {
      refetchQueue();
    }
  });
  
  const deleteUploadMutation = api.admin.deleteUploadQueueItem.useMutation({
    onSuccess: () => {
      refetchQueue();
    }
  });

  const handleCancelUpload = async (id: string) => {
    try {
      await cancelUploadMutation.mutateAsync({ id });
    } catch (error) {
      console.error("Error cancelling upload:", error);
    }
  };

  const handleDeleteUpload = async (id: string) => {
    if (!confirm("Are you sure you want to delete this upload? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteUploadMutation.mutateAsync({ id });
    } catch (error) {
      console.error("Error deleting upload:", error);
    }
  };

  const activeUploads = uploadQueue?.filter(item => 
    item.uploadStatus === "pending" || 
    item.uploadStatus === "uploading" || 
    item.uploadStatus === "processing"
  ) || [];
  
  const completedUploads = uploadQueue?.filter(item => 
    item.uploadStatus === "completed"
  ) || [];
  
  const failedUploads = uploadQueue?.filter(item => 
    item.uploadStatus === "failed" || 
    item.uploadStatus === "cancelled"
  ) || [];

  if (queueError) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load upload queue: {queueError.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Upload Queue</h2>
          <p className="text-muted-foreground">
            Monitor video uploads and AI content extraction progress
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {autoRefresh ? "Pause" : "Resume"} Auto-refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchQueue()}
            disabled={isQueueLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isQueueLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeUploads.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedUploads.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed/Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedUploads.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadQueue?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Queue List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {isQueueLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading uploads...
            </div>
          ) : uploadQueue && uploadQueue.length > 0 ? (
            <div className="space-y-4">
              {uploadQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    {/* File info and status */}
                    <div className="flex items-center space-x-3">
                      <Video className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{item.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {formatTimeAgo(new Date(item.createdAt))} • 
                          Updated {formatTimeAgo(new Date(item.updatedAt))}
                        </p>
                      </div>
                    </div>

                    {/* Upload Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(item.uploadStatus)}
                          <span>Upload: </span>
                          <Badge variant={getStatusBadgeVariant(item.uploadStatus)}>
                            {item.uploadStatus}
                          </Badge>
                        </div>
                        <span>{item.uploadProgress}%</span>
                      </div>
                      <Progress value={item.uploadProgress} className="h-2" />
                    </div>

                    {/* AI Extraction Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(item.aiExtractionStatus)}
                          <span>AI Extraction: </span>
                          <Badge variant={getStatusBadgeVariant(item.aiExtractionStatus)}>
                            {item.aiExtractionStatus}
                          </Badge>
                        </div>
                        <span>{item.aiExtractionProgress}%</span>
                      </div>
                      <Progress value={item.aiExtractionProgress} className="h-2" />
                    </div>

                    {/* Error Message */}
                    {item.errorMessage && (
                      <Alert variant="destructive" className="mt-2">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          {item.errorMessage}
                          {item.retryCount > 0 && (
                            <span className="block text-xs mt-1">
                              Retry {item.retryCount}/{item.maxRetries}
                            </span>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {(item.uploadStatus === "pending" || 
                      item.uploadStatus === "uploading" || 
                      item.uploadStatus === "processing") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelUpload(item.id)}
                        disabled={cancelUploadMutation.isPending}
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {(item.uploadStatus === "completed" || 
                      item.uploadStatus === "failed" || 
                      item.uploadStatus === "cancelled") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUpload(item.id)}
                        disabled={deleteUploadMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No uploads found. Upload your first video to get started!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}