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
      cycle: "/images/workouts/cycle.jpg",
      swim: "/images/workouts/swimming.jpg",
      walk: "/images/workouts/walking.jpg",
    };

    return localImages[activityType as keyof typeof localImages];
  };

  return (
    <Link
      href={link || `/dashboard/workout/${workout.id}`}
      className={`flex h-[${height}px] cursor-pointer flex-row items-stretch gap-3 rounded-lg bg-white p-3 shadow transition hover:bg-gray-50 hover:shadow-lg border-brand-sage lg:gap-4 lg:p-4 lg:h-auto lg:min-h-[140px]`}
    >
      <div className="flex w-24 lg:w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-brand-sage/10">
        <Image
          src={getActivityImage(workout.activityType || 'default')}
          alt={`${workout.activityType || 'fitness'} workout`}
          className=" rounded object-cover"
          width={96}
          height={96}
          onError={() => setImageError(true)}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-1 text-base lg:text-lg font-semibold">
          {workout.name}
        </div>
        <div className="mb-2 line-clamp-2 text-sm lg:text-base text-gray-500 lg:line-clamp-3">
          {workout.description}
        </div>
        <div className="mt-auto flex items-center gap-2 flex-wrap">
          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs lg:text-sm flex items-center gap-1 lg:px-3 lg:py-1">
            <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
            {workout.duration} min
          </span>
          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs lg:text-sm flex items-center gap-1 lg:px-3 lg:py-1">
            <Target className="h-3 w-3 lg:h-4 lg:w-4" />
            {workout.level}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default WorkoutCard; 