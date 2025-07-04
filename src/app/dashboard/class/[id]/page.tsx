'use client'
import { use } from "react";
import MuxPlayer from '@mux/mux-player-react';
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Users, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import MarkClassComplete from "@/app/_components/dashboard/MarkClassComplete";
import MarkClassMissed from "@/app/_components/dashboard/MarkClassMissed";
import type { WorkoutFormValues } from "@/app/_components/dashboard/MarkClassComplete";

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
  const { data: pilatesClass, isLoading } = api.workout.getPilatesClassViaWorkout.useQuery({ workoutId: id });
  const { data: workout } = api.workout.getWorkout.useQuery({ id });
  const utils = api.useUtils();

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
      toast.success("Class completed successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to complete class");
    },
  });

  if (isLoading || !pilatesClass?.mux_playback_id) {
    return <ClassPageSkeleton />;
  }

  const parsedTags = JSON.parse(pilatesClass?.tags) as string[];
  const equipmentList = pilatesClass?.equipment?.split(',').map(e => e.trim());
  const parsedExerciseSequence = JSON.parse(pilatesClass?.exerciseSequence) as string[];
  const targetedMuscles = pilatesClass?.targetedMuscles?.split(',').map(m => m.trim());

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
        {/* Back Button */}
        {/* Responsive flex row for desktop, stacked on mobile */}
        <div className="flex flex-col md:flex-row md:gap-8">
          {/* Video Player */}
          <div className="aspect-video bg-black w-full md:w-1/2 md:min-w-[340px] md:max-w-[420px] md:rounded-lg overflow-hidden">
            <MuxPlayer
              playbackId={pilatesClass?.mux_playback_id}
              metadata={{ title: pilatesClass?.title }}
              className="w-full h-full"
            />
          </div>

          {/* Info Section */}
          <div className="p-5 md:p-0 flex-1 flex flex-col justify-center">
            {/* Title and Summary */}
            <div className="mb-2">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight text-gray-900">{pilatesClass?.title}</h1>
              <p className="text-sm md:text-base text-muted-foreground">with {pilatesClass?.instructor}</p>
            </div>

            {/* Key Info Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-700 mb-2">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {pilatesClass?.duration} min
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {pilatesClass?.difficulty}
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                {pilatesClass?.focusArea}
              </div>
            </div>

            {/* Targeted Muscles */}
            <div className="flex flex-wrap gap-2 mb-2">
              {targetedMuscles.map((muscle, i) => (
                <Badge key={i} variant="outline" className="text-brand-brown border-brand-brown/30 px-2 py-0.5 text-xs md:text-sm font-medium">
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <hr className="my-4 border-gray-100" />

        {/* About Section */}
        <div className="px-5 md:px-0 mb-4">
          <h2 className="font-semibold text-base md:text-lg mb-1">About This Workout</h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">{pilatesClass?.description}</p>
        </div>

        {/* Equipment Needed */}
        <div className="px-5 md:px-0 mb-4">
          <h3 className="font-semibold text-sm md:text-base mb-1">Equipment Needed</h3>
          <div className="flex flex-wrap gap-2">
            {equipmentList.map((eq, i) => (
              <Badge key={i} variant="outline" className="text-gray-700 border-gray-200 px-2 py-0.5 text-xs md:text-sm font-medium">
                {eq}
              </Badge>
            ))}
          </div>
        </div>

        {/* Exercise Sequence */}
        <div className="px-5 md:px-0 mb-2">
          <h3 className="font-semibold text-sm md:text-base mb-2">Exercise Sequence</h3>
          <ol className="space-y-2">
            {parsedExerciseSequence.map((step: string, i: number) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-brand-brown text-white flex items-center justify-center font-bold text-sm md:text-base">
                  {i + 1}
                </span>
                <span className="text-gray-800 text-sm md:text-base">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Tags (now beneath exercise sequence) */}
        <div className="px-5 pt-2 md:px-0 mb-6">
          <div className="flex flex-wrap gap-2">
            {parsedTags.map((tag: string, i: number) => (
              <Badge key={i} variant="outline" className="text-gray-700 border-gray-200 px-2 py-0.5 text-xs md:text-sm font-medium">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

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
      </div>

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
