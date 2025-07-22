'use client'
import { use } from "react";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import MarkClassComplete from "@/app/_components/dashboard/MarkClassComplete";
import MarkClassMissed from "@/app/_components/dashboard/MarkClassMissed";
import type { WorkoutFormValues } from "@/app/_components/dashboard/MarkClassComplete";
import PilatesDetail from "@/app/_components/dashboard/PilatesDetail";
import AchievementsCard from '@/app/_components/dashboard/AchievementsCard';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
}

// Loading Skeleton Component
function ClassPageSkeleton() {
  return (
    <>
      <div>
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-brand-brown hover:text-brand-brown/80 mb-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Button>
      </div>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-brand-brown overflow-hidden md:p-8 p-0">
        <div className="flex flex-col md:flex-row md:gap-8">
          {/* Video Player Skeleton */}
          <div className="aspect-video bg-gray-200 w-full md:w-1/2 md:min-w-[340px] md:max-w-[420px] md:rounded-lg overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>

          {/* Info Section Skeleton */}
          <div className="p-5 md:p-0 flex-1 flex flex-col justify-center">
            {/* Title and Summary Skeleton */}
            <div className="mb-2">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Key Info Row Skeleton */}
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Targeted Muscles Skeleton */}
            <div className="flex flex-wrap gap-2 mb-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        <hr className="my-4 border-gray-100" />

        {/* About Section Skeleton */}
        <div className="px-5 md:px-0 mb-4">
          <Skeleton className="h-6 w-48 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>

        {/* Equipment Needed Skeleton */}
        <div className="px-5 md:px-0 mb-4">
          <Skeleton className="h-5 w-32 mb-2" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Exercise Sequence Skeleton */}
        <div className="px-5 md:px-0 mb-2">
          <Skeleton className="h-5 w-36 mb-2" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-7 h-7 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* Tags Skeleton */}
        <div className="px-5 pt-2 md:px-0 mb-6">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: pilatesClass, isLoading } = api.workout.getPilatesClassViaWorkout.useQuery({ workoutId: id });
  const { data: workout } = api.workout.getWorkout.useQuery({ id });
  const utils = api.useUtils();

  // Fetch achievements for this class
  const { data: achievements, isLoading: isAchievementsLoading } = api.workout.getAchievementForWorkout.useQuery({ workoutId: id });

  // State for dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMarkMissedDialogOpen, setIsMarkMissedDialogOpen] = useState(false);

  // Mutations
  const updateWorkoutStatus = api.workoutPlan.updateWorkoutStatus.useMutation({
    onSuccess: () => {
      void utils.workout.getWorkout.invalidate({ id });
      void utils.workout.getPilatesClassViaWorkout.invalidate({ workoutId: id });
      toast.success("Workout status updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update workout status");
    },
  });

  const insertCompletedClass = api.workoutPlan.insertCompletedClass.useMutation({
    onSuccess: () => {
      void utils.workout.getWorkout.invalidate({ id });
      void utils.workout.getPilatesClassViaWorkout.invalidate({ workoutId: id });
      void utils.workoutPlan.getActivePlan.invalidate();
      void utils.workout.getAchievementForWorkout.invalidate({ workoutId: id }); // Invalidate achievements query for this class
      toast.success("Class completed successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to complete class");
    },
  });

  // Helper functions for status icon and color
  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "not_completed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "not_recorded":
        return <XCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "not_completed":
        return "bg-red-100 text-red-800 border-red-200";
      case "not_recorded":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "not_completed":
        return "Not Completed";
      case "not_recorded":
        return "Not Recorded";
      default:
        return "Unknown";
    }
  };

  if (isLoading || !pilatesClass?.mux_playback_id) {
    return <ClassPageSkeleton />;
  }

  const parsedTags = pilatesClass?.tags ? JSON.parse(pilatesClass.tags) as string[] : [];
  const equipmentList = pilatesClass?.equipment?.split(',').map(e => e.trim()) ?? [];
  
  const parsedExerciseSequence = pilatesClass?.exerciseSequence ? JSON.parse(pilatesClass.exerciseSequence) as string[] : [];
  const targetedMuscles = pilatesClass?.targetedMuscles?.split(',').map(m => m.trim()) ?? [];

  const handleMarkMissed = () => {
    updateWorkoutStatus.mutate({
      workoutId: id,
      status: "not_completed"
    });
    setIsMarkMissedDialogOpen(false);
  };

  const handleSubmitWorkoutDetails = (
    workoutId: string,
    data: WorkoutFormValues,
    bookedDate: Date,
    name: string,
  ) => {
    insertCompletedClass.mutate({
      workoutId,
      activityType: "class",
      date: bookedDate,
      notes: data.notes,
      intensity: data.intensity,
      name,
      likelyToDoAgain: data.likelyToDoAgain,
    });
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-4 p-2">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Badge
          variant="outline"
          className={`${getStatusColor(workout?.status ?? null)} border`}
        >
          <div className="flex items-center gap-1">
            {getStatusIcon(workout?.status ?? null)}
            <span className="capitalize">{workout?.status?.replace('_', ' ') || 'Unknown'}</span>
          </div>
        </Badge>
      </div>
      {/* Show AchievementsCard if class is completed */}
      {workout?.status === 'completed' && (
        <AchievementsCard achievements={achievements ?? []} loading={isAchievementsLoading} />
      )}
      <PilatesDetail
        title={pilatesClass?.title ?? ""}
        instructor={pilatesClass?.instructor}
        duration={pilatesClass?.duration}
        difficulty={pilatesClass?.difficulty}
        focusArea={pilatesClass?.focusArea}
        description={pilatesClass?.description}
        equipmentList={equipmentList}
        exerciseSequence={parsedExerciseSequence}
        tags={parsedTags}
        targetedMuscles={targetedMuscles}
        mux_playback_id={pilatesClass?.mux_playback_id ?? undefined}
      >
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="space-y-4 px-5 md:px-0 pb-4"
        >
          <h3 className="text-lg font-semibold text-brand-brown">Quick Actions</h3>
          <div className="flex gap-3 justify-center">
            <Button
              className="bg-[#34C759]/90 text-white font-bold transition-colors hover:bg-[#34C759] w-1/2"
              onClick={() => {
                setIsDialogOpen(true);
              }}
              disabled={updateWorkoutStatus.isPending || workout?.status === "completed"}
            >
              <CheckCircle2 className="h-4 w-4" />
              {updateWorkoutStatus.isPending ? "Updating..." : "Mark Complete"}
            </Button>
            <Button
              className="bg-[#FF3B30]/80 text-white font-bold transition-colors hover:bg-[#FF3B30]/90 w-1/2"
              onClick={() => setIsMarkMissedDialogOpen(true)}
              disabled={updateWorkoutStatus.isPending || workout?.status === "not_completed"}
            >
              <XCircle className="h-4 w-4" />
              {updateWorkoutStatus.isPending ? "Updating..." : "Mark Missed"}
            </Button>
          </div>
        </motion.div>
      </PilatesDetail>
      {/* Dialogs */}
      <MarkClassComplete
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        handleSubmitWorkoutDetails={handleSubmitWorkoutDetails}
        workoutId={id}
        bookedDate={
          workout?.bookedDate
            ? new Date(workout.bookedDate)
            : new Date()
        }
        name={workout?.name ?? pilatesClass?.title ?? ""}
      />
      <MarkClassMissed
        isDialogOpen={isMarkMissedDialogOpen}
        setIsDialogOpen={setIsMarkMissedDialogOpen}
        onSubmit={handleMarkMissed}
        workoutId={id}
      />
    </>
  );
}
