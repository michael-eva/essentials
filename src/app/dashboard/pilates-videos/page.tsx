"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { PilatesVideosSkeleton } from "@/app/_components/dashboard/DashboardSkeleton";
import PilatesVideoLibraryCard from "@/app/_components/dashboard/PilatesVideoLibraryCard";

const PAGE_SIZE = 5;

type PilatesVideosData = {
  items: any[];
  total: number;
};

export default function PilatesVideosLibrary() {
  const [page, setPage] = useState(1);
  const [lastData, setLastData] = useState<PilatesVideosData | null>(null);

  const { data, isLoading, error } = api.workout.getPilatesVideos.useQuery({
    page,
    limit: PAGE_SIZE,
  });

  useEffect(() => {
    if (data) setLastData(data as PilatesVideosData);
  }, [data]);

  const currentData = data || lastData;
  const totalPages = currentData ? Math.ceil(currentData.total / PAGE_SIZE) : 1;

  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Error: {error.message}
      </div>
    );
  if (!currentData) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">All Pilates Videos</h1>
      <p className="mb-6 text-gray-600">Browse our full Pilates video library.</p>
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
