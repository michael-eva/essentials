"use client";
import { use } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import PilatesDetail from "@/app/_components/dashboard/PilatesDetail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";

export default function PilatesVideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const {
    data: video,
    isLoading,
    error,
    refetch,
  } = api.workout.getPilatesVideoById.useQuery({ id });

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;

  if (!video && !error) {
    // Situation 1: no video, no error
    return (
      <div className="p-6 text-center text-red-600">
        Video not found.
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!video && error) {
    // Situation 2: error present
    return (
      <div className="p-6 text-center text-red-600">
        Something went wrong. Please try again.
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Situation 3: video exists, no error
  // Prepare props for PilatesDetail
  const posterUrl = video.mux_playback_id
    ? `https://image.mux.com/${video.mux_playback_id}/thumbnail.png?width=384&height=216&fit_mode=smartcrop&time=35`
    : undefined;

  return (
    <div className="bg-background min-h-screen">
      <div className="p-2">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <PilatesDetail
        title={video.title}
        summary={video.summary}
        duration={video.duration}
        difficulty={video.difficulty}
        mux_playback_id={video.mux_playback_id}
        videoUrl={video.videoUrl}
        posterUrl={posterUrl}
        instructor={video.instructor}
        focusArea={video.focusArea}
        description={video.description}
        equipmentList={
          video.equipment ? video.equipment.split(",").map((e) => e.trim()) : []
        }
        exerciseSequence={video.exerciseSequence || []}
        tags={video.tags || []}
        targetedMuscles={
          video.targetedMuscles
            ? video.targetedMuscles.split(",").map((m) => m.trim())
            : []
        }
      />
    </div>
  );
}
