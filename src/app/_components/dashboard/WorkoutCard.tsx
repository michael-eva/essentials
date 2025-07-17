import React, { useState } from "react";
import Link from "next/link";
import type { Workout } from "@/drizzle/src/db/queries";
import { Activity, Clock, User, Target } from "lucide-react";
import Image from "next/image";

interface WorkoutCardProps {
  workout: Workout;
  link?: string;
  height?: number;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, link, height = 120 }) => {
  const [imageError, setImageError] = useState(false);

  const getActivityImage = (activityType: string | null) => {
    const localImages = {
      run: "/images/workouts/running.jpg",
      cycle: "/images/workouts/cycling.jpg",
      swim: "/images/workouts/swimming.jpg",
      walk: "/images/workouts/walking.jpg",
    };

    return localImages[activityType as keyof typeof localImages];
  };

  return (
    <Link
      href={link || `/dashboard/workout/${workout.id}`}
      className={`flex h-[${height}px] cursor-pointer flex-row items-stretch gap-3 rounded-lg bg-white p-3 shadow transition hover:bg-gray-50 hover:shadow-lg border-brand-sage`}
    >
      <div className="flex w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-brand-sage/10">
        <Image
          src={getActivityImage(workout.activityType || 'default')}
          alt={`${workout.activityType || 'fitness'} workout`}
          className="h-full w-full rounded object-cover"
          width={96}
          height={96}
          onError={() => setImageError(true)}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-1 text-base font-semibold">
          {workout.name}
        </div>
        <div className="mb-2 line-clamp-2 text-sm text-gray-500">
          {workout.description}
        </div>
        <div className="mt-auto flex items-center gap-2 flex-wrap">
          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs flex items-center gap-1">
            {workout.duration} min
          </span>
          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs flex items-center gap-1">
            {workout.level}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default WorkoutCard; 