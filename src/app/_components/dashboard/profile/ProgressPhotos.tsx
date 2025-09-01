"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Trash2, X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import Link from "next/link";
import CameraCapture from "./CameraCapture";
import PhotoGrid from "./PhotoGrid";
import DeleteConfirmation from "./DeleteConfirmation";

export default function ProgressPhotos() {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    id: string;
    imageUrl: string;
    takenAt: string;
  } | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  const { data: photos = [], refetch: refetchPhotos, isLoading } = api.progressPhotos.getAll.useQuery();
  
  const uploadMutation = api.progressPhotos.upload.useMutation({
    onSuccess: () => {
      toast.success("Photo saved successfully!");
      setShowCamera(false);
      refetchPhotos();
    },
    onError: (error) => {
      toast.error(`Failed to save photo: ${error.message}`);
    },
  });

  const deleteMutation = api.progressPhotos.delete.useMutation({
    onSuccess: () => {
      toast.success("Photo deleted successfully!");
      setPhotoToDelete(null);
      refetchPhotos();
    },
    onError: (error) => {
      toast.error(`Failed to delete photo: ${error.message}`);
    },
  });

  const handlePhotoCapture = (imageData: string) => {
    const fileName = `progress-${Date.now()}.jpg`;
    uploadMutation.mutate({
      imageData,
      fileName,
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    deleteMutation.mutate({ id: photoId });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Progress Photos</h2>
            <p className="text-gray-600">Track your fitness journey with progress photos</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCamera(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white"
          disabled={uploadMutation.isPending}
        >
          <Camera className="h-4 w-4 mr-2" />
          Take Photo
        </Button>
      </div>

      {/* Photo Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{photos.length}</div>
          <div className="text-sm text-gray-600">Total Photos</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">
            {photos.length > 0 ? Math.ceil((Date.now() - new Date(photos[photos.length - 1]?.takenAt || 0).getTime()) / (1000 * 60 * 60 * 24)) : 0}
          </div>
          <div className="text-sm text-gray-600">Days Since First Photo</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">
            {photos.length > 0 ? Math.ceil((Date.now() - new Date(photos[0]?.takenAt || 0).getTime()) / (1000 * 60 * 60 * 24)) : 0}
          </div>
          <div className="text-sm text-gray-600">Days Since Last Photo</div>
        </Card>
      </div>

      {/* Photo Grid */}
      <PhotoGrid
        photos={photos}
        isLoading={isLoading}
        onPhotoClick={setSelectedPhoto}
        onDeleteClick={setPhotoToDelete}
      />

      {/* Empty State */}
      {!isLoading && photos.length === 0 && (
        <div className="text-center py-12">
          <Camera className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No progress photos yet</h3>
          <p className="text-gray-600 mb-6">Start tracking your fitness journey by taking your first progress photo.</p>
          <Button
            onClick={() => setShowCamera(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Camera className="h-4 w-4 mr-2" />
            Take First Photo
          </Button>
        </div>
      )}

      {/* Camera Modal */}
      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Take Progress Photo</DialogTitle>
          </DialogHeader>
          <CameraCapture
            onCapture={handlePhotoCapture}
            onCancel={() => setShowCamera(false)}
            isUploading={uploadMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Photo Viewer Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {selectedPhoto && (
              <div className="flex flex-col">
                <div className="relative">
                  <img
                    src={selectedPhoto.imageUrl}
                    alt="Progress photo"
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                </div>
                <div className="p-4 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Taken on {formatDate(selectedPhoto.takenAt)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPhotoToDelete(selectedPhoto.id);
                        setSelectedPhoto(null);
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Photo
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={!!photoToDelete}
        onConfirm={() => photoToDelete && handleDeletePhoto(photoToDelete)}
        onCancel={() => setPhotoToDelete(null)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}