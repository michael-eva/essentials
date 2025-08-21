"use client";
import React, { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Calendar, Video } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ClassDraft = {
  id: string;
  sessionId: string;
  muxAssetId?: string | null;
  muxPlaybackId?: string | null;
  chatHistory?: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }> | null;
  extractedData?: any;
  createdAt: Date;
  updatedAt: Date;
};

export default function AdminDraftsPage() {
  const router = useRouter();
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  
  // For now, we'll need to add a query to get all drafts
  // This would require adding a new endpoint to the admin router
  const { data: drafts, isLoading, refetch } = api.admin.getAllDrafts.useQuery();
  const deleteDraftMutation = api.admin.deleteDraft.useMutation({
    onSuccess: () => {
      refetch();
      setDeleteSessionId(null);
    },
  });

  const handleEditDraft = (sessionId: string) => {
    router.push(`/admin/class/new?sessionId=${sessionId}`);
  };

  const handleDeleteDraft = (sessionId: string) => {
    setDeleteSessionId(sessionId);
  };

  const confirmDelete = () => {
    if (deleteSessionId) {
      deleteDraftMutation.mutate({ sessionId: deleteSessionId });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getDraftTitle = (draft: ClassDraft) => {
    if (draft.extractedData?.title) {
      return draft.extractedData.title;
    }
    return `Draft ${draft.sessionId.slice(0, 8)}`;
  };

  const getDraftStatus = (draft: ClassDraft) => {
    if (draft.muxPlaybackId && draft.extractedData?.title) {
      return { label: "Ready to Publish", variant: "default" as const };
    }
    if (draft.muxAssetId) {
      return { label: "Video Uploaded", variant: "outline" as const };
    }
    return { label: "In Progress", variant: "secondary" as const };
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Draft Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Draft Videos</h2>
          <Button
            variant="outline"
            onClick={() => router.push("/admin")}
          >
            Back to Admin Dashboard
          </Button>
        </div>

        {!drafts || drafts.length === 0 ? (
          <div className="text-center py-12">
            <Video className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No drafts</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any draft videos yet. Start by uploading a new class.
            </p>
            <div className="mt-6">
              <Button onClick={() => router.push("/admin/class/new")}>
                Upload New Class
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => {
              const status = getDraftStatus(draft);
              return (
                <Card key={draft.id} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{getDraftTitle(draft)}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(draft.updatedAt)}
                        </CardDescription>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      {draft.muxAssetId && (
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Video uploaded
                        </div>
                      )}
                      {draft.extractedData && Object.keys(draft.extractedData).length > 0 && (
                        <div>
                          {Object.keys(draft.extractedData).length} fields extracted
                        </div>
                      )}
                      {draft.chatHistory && (
                        <div>
                          {draft.chatHistory.length} chat messages
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditDraft(draft.sessionId)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Continue
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDraft(draft.sessionId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteSessionId} onOpenChange={() => setDeleteSessionId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Draft</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this draft? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSessionId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteDraftMutation.isPending}
            >
              {deleteDraftMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}