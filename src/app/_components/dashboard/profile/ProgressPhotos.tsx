"use client";

import { useState, useRef, useEffect } from "react";
import * as React from "react";
import { createPortal } from "react-dom";
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

  // Prevent body scroll when camera is open
  React.useEffect(() => {
    if (showCamera) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [showCamera]);
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
      <div className="relative">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/dashboard/profile">
            <Button variant="ghost" size="sm" className="gap-2 text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-3 py-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
        </div>

        {/* Main Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Progress Photos
            </h1>
            <p className="text-gray-600 text-base">
              Track your fitness journey with visual progress
            </p>
          </div>

          <div className="flex-shrink-0">
            <Button
              onClick={() => setShowCamera(true)}
              size="lg"
              className="bg-brand-bright-orange text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
              disabled={uploadMutation.isPending}
            >
              <Camera className="h-5 w-5 mr-2" />
              Take Photo
            </Button>
          </div>
        </div>
      </div>

      {/* Photo Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-shadow duration-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-700 mb-2">{photos.length}</div>
            <div className="text-sm font-medium text-blue-600">Total Photos</div>
          </div>
        </Card>
        <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 hover:shadow-md transition-shadow duration-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-700 mb-2">
              {photos.length > 0 ? Math.ceil((Date.now() - new Date(photos[photos.length - 1]?.takenAt || 0).getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <div className="text-sm font-medium text-green-600">Days Since First Photo</div>
          </div>
        </Card>
        <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-md transition-shadow duration-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-700 mb-2">
              {photos.length > 0 ? Math.ceil((Date.now() - new Date(photos[0]?.takenAt || 0).getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <div className="text-sm font-medium text-amber-600">Days Since Last Photo</div>
          </div>
        </Card>
      </div> */}

      {/* Photo Grid */}
      <PhotoGrid
        photos={photos.map(photo => ({
          ...photo,
          takenAt: photo.takenAt.toISOString(),
          createdAt: photo.createdAt.toISOString()
        }))}
        isLoading={isLoading}
        onPhotoClick={setSelectedPhoto}
        onDeleteClick={setPhotoToDelete}
      />

      {/* Empty State */}
      {!isLoading && photos.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-6">
            <Camera className="h-10 w-10 text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No progress photos yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start tracking your fitness journey by taking your first progress photo.
            Visual progress helps you stay motivated and see your transformation over time.
          </p>
          <Button
            onClick={() => setShowCamera(true)}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
          >
            <Camera className="h-5 w-5 mr-2" />
            Take First Photo
          </Button>
        </div>
      )}

      {/* Camera Full-Screen Overlay */}
      {showCamera && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 bg-black"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999999,
            isolation: 'isolate'
          }}
        >
          <CameraCapture
            onCapture={handlePhotoCapture}
            onCancel={() => setShowCamera(false)}
            isUploading={uploadMutation.isPending}
          />
        </div>,
        document.body
      )}

      {/* Photo Viewer Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)} >
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black border-none pt-4" showCloseButton={false}>
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
                <div className="relative pb-4">
                  <img
                    src={selectedPhoto.imageUrl}
                    alt="Progress photo"
                    className="w-full h-auto px-4 object-contain"
                  />
                </div>
                {/* <div className="p-4 border-t bg-white">
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
                </div> */}
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