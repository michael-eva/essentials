"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Photo {
  id: string;
  imageUrl: string;
  takenAt: string;
  createdAt: string;
}

interface PhotoGridProps {
  photos: Photo[];
  isLoading: boolean;
  onPhotoClick: (photo: { id: string; imageUrl: string; takenAt: string }) => void;
  onDeleteClick: (photoId: string) => void;
}

export default function PhotoGrid({ photos, isLoading, onPhotoClick, onDeleteClick }: PhotoGridProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AnimatePresence>
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="group relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <img
                src={photo.imageUrl}
                alt={`Progress photo from ${formatDate(photo.takenAt)}`}
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => onPhotoClick({
                  id: photo.id,
                  imageUrl: photo.imageUrl,
                  takenAt: photo.takenAt
                })}
                loading="lazy"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-gray-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPhotoClick({
                        id: photo.id,
                        imageUrl: photo.imageUrl,
                        takenAt: photo.takenAt
                      });
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-red-100 hover:bg-red-200 text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(photo.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Photo Info */}
            <div className="p-3">
              <div className="text-sm font-medium text-gray-900">
                {formatDate(photo.takenAt)}
              </div>
              <div className="text-xs text-gray-500">
                {formatTime(photo.takenAt)}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}