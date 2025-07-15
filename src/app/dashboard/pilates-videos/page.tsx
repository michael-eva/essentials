"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { PilatesVideosSkeleton } from "@/app/_components/dashboard/DashboardSkeleton";
import PilatesVideoLibraryCard from "@/app/_components/dashboard/PilatesVideoLibraryCard";
import PilatesVideosFilterModal from "./PilatesVideosFilterModal";

const PAGE_SIZE = 5;

type PilatesVideosData = {
  items: any[];
  total: number;
};

const DIFFICULTY_OPTIONS = ["All", "Beginner", "Intermediate", "Moderate"];
const EQUIPMENT_OPTIONS = ["All", "None", "Booty band", "Ankle weights", "Optional booty band or ankle weights"];
const INSTRUCTOR_OPTIONS = ["All", "Sarah Johnson", "Emma Uden"];

export default function PilatesVideosLibrary() {
  const [page, setPage] = useState(1);
  const [lastData, setLastData] = useState<PilatesVideosData | null>(null);
  const [difficulty, setDifficulty] = useState("All");
  const [equipment, setEquipment] = useState("All");
  const [instructor, setInstructor] = useState("All");
  const [minDuration, setMinDuration] = useState(0);
  const [maxDuration, setMaxDuration] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // For staged filter values in modal
  const [pendingDifficulty, setPendingDifficulty] = useState(difficulty);
  const [pendingEquipment, setPendingEquipment] = useState(equipment);
  const [pendingInstructor, setPendingInstructor] = useState(instructor);
  const [pendingMinDuration, setPendingMinDuration] = useState(minDuration);
  const [pendingMaxDuration, setPendingMaxDuration] = useState(maxDuration);

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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-4">
        <h1 className="text-3xl font-bold mb-2">All Pilates Videos</h1>
      </div>
      <p className="mb-6 text-gray-600">Browse our full Pilates video library.</p>
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
      <div className="relative">
        {isLoading ? (
          <div className="flex flex-col gap-8">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <PilatesVideosSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
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
