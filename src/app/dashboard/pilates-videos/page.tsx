"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PilatesVideosSkeleton } from "@/app/_components/dashboard/DashboardSkeleton";
import PilatesVideoLibraryCard from "@/app/_components/dashboard/PilatesVideoLibraryCard";
import PilatesVideosFilterModal from "@/app/_components/PilatesVideosFilterModal";
import type { PilatesVideo } from "@/types/pilates";

const PAGE_SIZE = 5;

type PilatesVideosData = {
  items: PilatesVideo[];
  total: number;
};

function buildSortedOptions(options?: string[]): string[] {
  return [
    "All",
    ...(options ?? [])
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  ];
}

export default function PilatesVideosLibrary() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [lastData, setLastData] = useState<PilatesVideosData | null>(null);
  const [difficulty, setDifficulty] = useState("All");
  const [equipment, setEquipment] = useState("All");
  const [instructor, setInstructor] = useState("All");
  const [minDuration, setMinDuration] = useState(0);
  const [maxDuration, setMaxDuration] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  // For staged filter values in modal
  const [pendingDifficulty, setPendingDifficulty] = useState(difficulty);
  const [pendingEquipment, setPendingEquipment] = useState(equipment);
  const [pendingInstructor, setPendingInstructor] = useState(instructor);
  const [pendingMinDuration, setPendingMinDuration] = useState(minDuration);
  const [pendingMaxDuration, setPendingMaxDuration] = useState(maxDuration);

  const { data: filterOptions, isLoading: isLoadingFilters } = api.workout.getPilatesVideoFilterOptions.useQuery();
  const DIFFICULTY_OPTIONS = buildSortedOptions(filterOptions?.difficulty);
  const EQUIPMENT_OPTIONS = buildSortedOptions(filterOptions?.equipment);
  const INSTRUCTOR_OPTIONS = buildSortedOptions(filterOptions?.instructor);

  const { data, isLoading, error } = api.workout.getPilatesVideos.useQuery({
    page,
    limit: PAGE_SIZE,
    difficulty: difficulty !== "All" ? difficulty : undefined,
    equipment: equipment !== "All" ? equipment : undefined,
    instructor: instructor !== "All" ? instructor : undefined,
    minDuration: minDuration > 0 ? minDuration : undefined,
    maxDuration: maxDuration > 0 ? maxDuration : undefined,
  });

  useEffect(() => {
    if (data) setLastData(data as PilatesVideosData);
  }, [data]);

  const currentData = data || lastData;
  const totalPages = currentData ? Math.max(1, Math.ceil(currentData.total / PAGE_SIZE)) : 1;

  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Error: {error.message}
      </div>
    );
  if (!currentData) return null;

  // Clear all filters
  const handleClearAll = () => {
    setPendingDifficulty("All");
    setPendingEquipment("All");
    setPendingInstructor("All");
    setPendingMinDuration(0);
    setPendingMaxDuration(0);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setDifficulty(pendingDifficulty);
    setEquipment(pendingEquipment);
    setInstructor(pendingInstructor);
    setMinDuration(pendingMinDuration);
    setMaxDuration(pendingMaxDuration);
    setPage(1); // Reset to first page on filter
    setIsDialogOpen(false);
  };

  // Handle redirect to personal trainer
  const handleGoToPersonalTrainer = () => {
    setIsHelpModalOpen(false);
    router.push("/dashboard/mypt");
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Pilates Videos</h1>
          <p className="text-gray-600">Browse our full Pilates video library.</p>
        </div>

      </div>
      <div className="flex justify-between pb-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setIsHelpModalOpen(true)}
            className="text-sm"
          >
            Don&apos;t know where to start?
          </Button>
        </div>
        <PilatesVideosFilterModal
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          DIFFICULTY_OPTIONS={DIFFICULTY_OPTIONS}
          EQUIPMENT_OPTIONS={EQUIPMENT_OPTIONS}
          INSTRUCTOR_OPTIONS={INSTRUCTOR_OPTIONS}
          pendingDifficulty={pendingDifficulty}
          setPendingDifficulty={setPendingDifficulty}
          pendingEquipment={pendingEquipment}
          setPendingEquipment={setPendingEquipment}
          pendingInstructor={pendingInstructor}
          setPendingInstructor={setPendingInstructor}
          pendingMinDuration={pendingMinDuration}
          setPendingMinDuration={setPendingMinDuration}
          pendingMaxDuration={pendingMaxDuration}
          setPendingMaxDuration={setPendingMaxDuration}
          handleClearAll={handleClearAll}
          handleApplyFilters={handleApplyFilters}
        />

      </div>
      {/* Help Modal */}
      <Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Need Help Getting Started?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Not sure which Pilates video to choose? Let your Personal Trainer guide you! They can recommend the perfect videos based on your fitness level, goals, and preferences.
            </p>
          </div>
          <DialogFooter className="flex flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsHelpModalOpen(false)}
            >
              Stay Here
            </Button>
            <Button
              onClick={handleGoToPersonalTrainer}
            >
              Go to Personal Trainer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="relative">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <PilatesVideosSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentData.items.map((video) => (
              <PilatesVideoLibraryCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-center gap-4 mt-6">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span className="self-center">
          Page {page} of {totalPages}
        </span>
        <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
