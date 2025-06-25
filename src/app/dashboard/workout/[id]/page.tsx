'use client'
import { api } from '@/trpc/react';
import { ArrowLeft, Clock, Activity, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import DefaultBox from '@/app/_components/global/DefaultBox';
import { motion } from 'framer-motion';
import RecordManualActivity, { type ActivityFormValues } from '@/app/_components/dashboard/RecordManualActivity';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
}

export default function WorkoutPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: workout, isLoading, error } = api.workout.getWorkout.useQuery({ id });
  const utils = api.useUtils();
  const [isManualActivityDialogOpen, setIsManualActivityDialogOpen] = useState(false);
  // Mutations
  const updateWorkoutStatus = api.workoutPlan.updateWorkoutStatus.useMutation({
    onSuccess: () => {
      void utils.workout.getWorkout.invalidate({ id });
      toast.success("Workout status updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update workout status");
    },
  });

  const insertManualActivity = api.workoutPlan.insertManualActivity.useMutation({
    onSuccess: () => {
      void utils.workout.getWorkout.invalidate({ id });
      void utils.workoutPlan.getActivePlan.invalidate();
      toast.success("Activity recorded successfully");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DefaultBox
          title="Workout Details"
          description="Loading workout information..."
          showViewAll={false}
        >
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </DefaultBox>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="space-y-6">
        <DefaultBox
          title="Workout Not Found"
          description="The workout you're looking for doesn't exist or you don't have permission to view it."
          showViewAll={false}
        >
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-brand-brown/50 mb-4" />
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </Button>
          </div>
        </DefaultBox>
      </div>
    );
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "not_completed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "not_recorded":
        return <AlertCircle className="h-5 w-5 text-brand-bright-orange" />;
      default:
        return <AlertCircle className="h-5 w-5 text-brand-brown/50" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "not_completed":
        return "bg-red-100 text-red-800 border-red-200";
      case "not_recorded":
        return "bg-brand-bright-orange/10 text-brand-bright-orange border-brand-bright-orange/20";
      default:
        return "bg-brand-brown/10 text-brand-brown border-brand-brown/20";
    }
  };

  const getActivityTypeIcon = (activityType: string | null) => {
    switch (activityType) {
      case "run":
        return <Activity className="h-6 w-6 text-brand-cobalt" />;
      case "cycle":
        return <Activity className="h-6 w-6 text-brand-sage" />;
      case "swim":
        return <Activity className="h-6 w-6 text-brand-cobalt" />;
      case "walk":
        return <Activity className="h-6 w-6 text-brand-bright-orange" />;
      case "hike":
        return <Activity className="h-6 w-6 text-brand-brown" />;
      case "rowing":
        return <Activity className="h-6 w-6 text-brand-cobalt" />;
      case "elliptical":
        return <Activity className="h-6 w-6 text-brand-bright-orange" />;
      default:
        return <Activity className="h-6 w-6 text-brand-brown" />;
    }
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };


  const handleMarkMissed = () => {
    updateWorkoutStatus.mutate({
      workoutId: workout.id,
      status: "not_completed"
    });
  };

  const handleSubmitManualActivity = async (data: ActivityFormValues) => {
    // First update the workout status to completed
    await updateWorkoutStatus.mutateAsync({
      workoutId: workout.id,
      status: "completed"
    });

    // Then insert the manual activity
    insertManualActivity.mutate(data);
    setIsManualActivityDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-brand-brown hover:text-brand-brown/80"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Button>
        <Badge
          variant="outline"
          className={`${getStatusColor(workout.status)} border`}
        >
          <div className="flex items-center gap-1">
            {getStatusIcon(workout.status)}
            <span className="capitalize">{workout.status?.replace('_', ' ') || 'Unknown'}</span>
          </div>
        </Badge>
      </div>

      {/* Workout Details */}
      <DefaultBox
        title={workout.name}
        description={workout.description}
        showViewAll={false}
      >
        <div className="space-y-6">
          {/* Workout Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-3 p-4 rounded-lg border border-brand-nude bg-brand-light-nude"
            >
              <Clock className="h-5 w-5 text-brand-brown" />
              <div>
                <p className="text-sm text-brand-brown/70">Duration</p>
                <p className="font-semibold text-brand-brown">{formatDuration(workout.duration)}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center gap-3 p-4 rounded-lg border border-brand-nude bg-brand-light-nude"
            >
              {getActivityTypeIcon(workout.activityType)}
              <div>
                <p className="text-sm text-brand-brown/70">Activity Type</p>
                <p className="font-semibold text-brand-brown capitalize">{workout.activityType || 'Workout'}</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-brand-brown">Quick Actions</h3>
            <div className="flex gap-3 justify-center">

              <>
                <Button
                  className="bg-[#34C759]/90 text-white font-bold transition-colors hover:bg-[#34C759] w-1/2"
                  onClick={() => {
                    setIsManualActivityDialogOpen(true);
                  }}
                  disabled={updateWorkoutStatus.isPending || workout.status === "completed"}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {updateWorkoutStatus.isPending ? "Updating..." : "Mark Complete"}
                </Button>
                <Button
                  className="bg-[#FF3B30]/80 text-white font-bold transition-colors hover:bg-[#FF3B30]/90 w-1/2"
                  onClick={handleMarkMissed}
                  disabled={updateWorkoutStatus.isPending || workout.status === "not_completed"}
                >
                  <XCircle className="h-4 w-4" />
                  {updateWorkoutStatus.isPending ? "Updating..." : "Mark Missed"}
                </Button>
              </>
            </div>
          </motion.div>
        </div>
      </DefaultBox>
      <RecordManualActivity
        workoutId={workout.id}
        initialActivityType={workout.activityType ?? undefined}
        isDialogOpen={isManualActivityDialogOpen}
        setIsDialogOpen={setIsManualActivityDialogOpen}
        handleSubmitActivity={handleSubmitManualActivity}
        // initialDurationHours={workout.duration}
        initialDurationMinutes={workout.duration}
      />
    </div>
  );
}
