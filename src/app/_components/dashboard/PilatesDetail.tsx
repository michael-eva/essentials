import React from "react";
import { useRouter } from "next/navigation";

import MuxPlayer from "@mux/mux-player-react";
import { Clock, Users, Target, ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface PilatesDetailProps {
  title: string;
  summary?: string;
  description?: string;
  difficulty?: string;
  duration: number | string;
  equipmentList?: string[];
  instructor: string | null;
  focusArea?: string;
  exerciseSequence?: string[];
  tags?: string[];
  targetedMuscles?: string[];
  mux_playback_id?: string | null;
  videoUrl?: string;
  posterUrl?: string;
  children?: React.ReactNode;
}

const PilatesDetail: React.FC<PilatesDetailProps> = ({
  title,
  instructor,
  duration,
  difficulty,
  focusArea,
  description,
  equipmentList = [],
  exerciseSequence = [],
  tags = [],
  targetedMuscles = [],
  mux_playback_id,
  posterUrl,
  summary,
  children,
}) => {
  const router = useRouter();

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

      <div className="border-brand-brown mx-auto max-w-3xl overflow-hidden rounded-lg border bg-white p-0 shadow-sm md:p-8">
        <div className="flex flex-col md:flex-row md:gap-8">
          {/* Video Player */}
          <div className="aspect-video w-full overflow-hidden bg-black md:w-1/2 md:max-w-[420px] md:min-w-[340px] md:rounded-lg">
            {mux_playback_id ? (
              <MuxPlayer
                playbackId={mux_playback_id}
                metadata={{ title }}
                className="h-full w-full"
                poster={posterUrl}
              />
            ) : posterUrl ? (
              <Image
                src={posterUrl}
                alt="class thumbnail"
                className="h-full w-full rounded-md object-cover"
                width={200}
                height={150}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-5xl text-gray-300">
                ▶️
              </span>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-1 flex-col justify-center p-5 md:p-0">
            {/* Title and Summary */}
            <div className="mb-2">
              <h1 className="text-xl leading-tight font-semibold text-gray-900 md:text-2xl lg:text-3xl">
                {title}
              </h1>
              {instructor && (
                <p className="text-muted-foreground text-sm md:text-base">
                  with {instructor}
                </p>
              )}
              {summary && (
                <p className="mt-1 text-sm text-gray-500 md:text-base">
                  {summary}
                </p>
              )}
            </div>

            {/* Key Info Row */}
            <div className="mb-2 flex flex-wrap items-center gap-4 text-sm text-gray-700 md:text-base">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {duration} min
              </div>
              {difficulty && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {difficulty}
                </div>
              )}
              {focusArea && (
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {focusArea}
                </div>
              )}
            </div>

            {/* Targeted Muscles */}
            {targetedMuscles && targetedMuscles.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {targetedMuscles.map((muscle, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-brand-brown border-brand-brown/30 px-2 py-0.5 text-xs font-medium md:text-sm"
                  >
                    {muscle}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <hr className="my-4 border-gray-100" />

        {/* About Section */}
        {description && (
          <div className="mb-4 px-5 md:px-0">
            <h2 className="mb-1 text-base font-semibold md:text-lg">
              About This Workout
            </h2>
            <p className="text-sm leading-relaxed text-gray-700 md:text-base">
              {description}
            </p>
          </div>
        )}

        {/* Equipment Needed */}
        {equipmentList && equipmentList.length > 0 && (
          <div className="mb-4 px-5 md:px-0">
            <h3 className="mb-1 text-sm font-semibold md:text-base">
              Equipment Needed
            </h3>
            <div className="flex flex-wrap gap-2">
              {equipmentList.map((eq, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 md:text-sm"
                >
                  {eq}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Sequence */}
        {exerciseSequence && exerciseSequence.length > 0 && (
          <div className="mb-2 px-5 md:px-0">
            <h3 className="mb-2 text-sm font-semibold md:text-base">
              Exercise Sequence
            </h3>
            <ol className="space-y-2">
              {exerciseSequence.map((step, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="bg-brand-brown flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white md:text-base">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-800 md:text-base">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mb-6 px-5 pt-2 md:px-0">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 md:text-sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Slot for Quick Actions or other children */}
        {children}
      </div>
    </div>
  );
};

export default PilatesDetail;
