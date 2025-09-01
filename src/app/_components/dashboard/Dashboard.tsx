"use client";

import {
  CalendarDays,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
} from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import DefaultBox from "../global/DefaultBox";

import { useState } from "react";
import MarkClassComplete from "./MarkClassComplete";
import type { WorkoutFormValues } from "./MarkClassComplete";
import RecordManualActivity from "./RecordManualActivity";
import type { ActivityFormValues } from "./RecordManualActivity";
import { toast } from "sonner";
import type { workoutStatusEnum } from "@/drizzle/src/db/schema";
import useGeneratePlan from "@/hooks/useGeneratePlan";
import {
  UpcomingClassesSkeleton,
  ActivityHistorySkeleton,
} from "./DashboardSkeleton";
import { ProgressSection } from "./ProgressSection";
import MarkClassMissed from "./MarkClassMissed";
import { useRouter } from "next/navigation";
import type { Workout, WorkoutTracking } from "@/drizzle/src/db/queries";
import PilatesVideoGrid from "@/app/_components/dashboard/PilatesVideoGrid";
import Image from "next/image";
import { localImages } from "@/app/_constants/local_images";
type WorkoutStatus = (typeof workoutStatusEnum.enumValues)[number];

export default function Dashboard() {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: pilatesVideos, isLoading: isLoadingPilatesVideos } = api.workout.getPilatesVideos.useQuery({
    limit: 3,
    random: true,
  });
  const { data: upcomingClasses, isLoading: isLoadingUpcomingClasses } =
    api.workoutPlan.getUpcomingActivities.useQuery();
  const { data: pastWorkoutsData = { workouts: [], currentWeek: undefined } } =
    api.workoutPlan.getWorkoutsToLog.useQuery();
  const { data: activityHistory = [], isLoading: isLoadingActivityHistory } =
    api.workoutPlan.getActivityHistory.useQuery({});
  const { mutate: insertManualActivity, isPending: isInsertingManualActivity } =
    api.workoutPlan.insertManualActivity.useMutation({
      onSuccess: () => {
        void utils.workoutPlan.getActivityHistory.invalidate();
        void utils.workoutPlan.getWorkoutsToLog.invalidate();
        void utils.workoutPlan.getUpcomingActivities.invalidate();
        void utils.workoutPlan.getActivePlan.invalidate();
      },
    });
  const { mutate: insertCompletedClass, isPending: isInsertingCompletedClass } =
    api.workoutPlan.insertCompletedClass.useMutation({
      onSuccess: () => {
        void toast.success("Workout details saved successfully");
        void utils.workoutPlan.getWorkoutsToLog.invalidate();
        void utils.workoutPlan.getActivityHistory.invalidate();
      },
    });
  const { mutate: updateWorkoutStatus, isPending: isUpdatingWorkoutStatus } =
    api.workoutPlan.updateWorkoutStatus.useMutation({
      onSuccess: () => {
        void utils.workoutPlan.getWorkoutsToLog.invalidate();
      },
    });
  const { generatePlan, isLoading, LoadingScreen, GeneratePlanDialog } = useGeneratePlan();

  const [selectedWorkout, setSelectedWorkout] = useState<
    (typeof pastWorkoutsData.workouts)[0] | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMarkMissedDialogOpen, setIsMarkMissedDialogOpen] = useState(false);
  const [isManualActivityDialogOpen, setIsManualActivityDialogOpen] =
    useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Helper function to check if we have workouts or a status
  const hasWorkouts = Array.isArray(upcomingClasses) && upcomingClasses.length > 0;
  const planStatus = !Array.isArray(upcomingClasses) ? upcomingClasses : null;


  const handleSubmitMarkMissed = (workoutId: string) => {
    updateWorkoutStatus({ workoutId, status: "not_completed" });
    setIsMarkMissedDialogOpen(false);
    setSelectedWorkout(null);
  };

  const handleSubmitWorkoutDetails = (
    workoutId: string,
    data: WorkoutFormValues,
    bookedDate: Date,
    name: string,
  ) => {
    insertCompletedClass({
      workoutId,
      activityType: "class",
      date: bookedDate,
      notes: data.notes,
      intensity: data.intensity,
      likelyToDoAgain: data.likelyToDoAgain,
      name,
    });

    setIsDialogOpen(false);
    setSelectedWorkout(null);
  };

  const handleSubmitManualActivity = async (data: ActivityFormValues, workoutId?: string) => {
    setIsManualActivityDialogOpen(false);


    insertManualActivity({ ...data, workoutId: workoutId ? workoutId : null }, {
      onSuccess: () => {
        toast.success("Activity recorded successfully");
      },
      onError: (error) => {
        console.error("Failed to record activity:", error);
        toast.error("Failed to record activity");
        setIsManualActivityDialogOpen(true);
      },
    });

  };

  const handleGeneratePlan = () => {
    generatePlan();
  };

  // Handle redirect to personal trainer
  const handleGoToPersonalTrainer = () => {
    setIsHelpModalOpen(false);
    router.push("/dashboard/mypt");
  };

  const handleUpcomingWorkoutClick = (workout: Workout) => {
    if (workout.type === "class") {
      router.push(`/dashboard/class/${workout.id}`);
    } else {
      router.push(`/dashboard/workout/${workout.id}`);
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {GeneratePlanDialog}
      <LoadingScreen />


      {/* Desktop Grid Layout - Pilates Videos and Progress */}
      <div className="lg:grid lg:grid-cols-1 lg:gap-8 lg:space-y-0 space-y-6">
        <DefaultBox
          title="Pilates Videos"
          description="Start a Pilates class anytime"
          showViewAll={true}
          viewAllHref='pilates-videos'
        >
          <div className="mb-4">
            <Button
              onClick={() => setIsHelpModalOpen(true)}
            >
              Don&apos;t know where to start?
            </Button>
          </div>
          {isLoadingPilatesVideos ? (
            <div className="py-8 text-center text-gray-500">Loading videos...</div>
          ) : !pilatesVideos || pilatesVideos?.items.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No videos available.</div>
          ) : (
            <PilatesVideoGrid videos={pilatesVideos.items} />
          )}
        </DefaultBox>
        {/* Full Width Section - Upcoming Workouts */}
        <DefaultBox
          title="Upcoming Workouts"
          description={
            hasWorkouts
              ? "Your scheduled workouts:"
              : planStatus?.status === "no_plan"
                ? "No workout plan created yet"
                : planStatus?.status === "plan_paused"
                  ? `Your plan "${planStatus.planName}" is currently paused`
                  : planStatus?.status === "plan_inactive"
                    ? `Your plan "${planStatus.planName}" is inactive`
                    : "No upcoming workouts scheduled"
          }
          viewAllText="View All Upcoming Workouts"
          viewAllHref="your-plan"
        >
          {isLoadingUpcomingClasses ? (
            <UpcomingClassesSkeleton />
          ) : !hasWorkouts ? (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-brand-brown bg-brand-light-nude px-4 py-8 text-center">
              <div className="flex flex-col items-center space-y-2">
                <CalendarDays className="h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {planStatus?.status === "no_plan"
                    ? "No Workout Plan"
                    : planStatus?.status === "plan_paused"
                      ? "Plan Paused"
                      : planStatus?.status === "plan_inactive"
                        ? "Plan Inactive"
                        : "No Upcoming Workouts"}
                </h3>
                <p className="mb-6 max-w-md text-center text-gray-500">
                  {planStatus?.status === "no_plan"
                    ? "You don't have any workout plans yet. Create a workout plan to get started with your fitness journey!"
                    : planStatus?.status === "plan_paused"
                      ? `Your plan "${planStatus.planName}" is currently paused. Resume it to see your upcoming workouts.`
                      : planStatus?.status === "plan_inactive"
                        ? `Your plan "${planStatus.planName}" is inactive. Activate it to see your upcoming workouts.`
                        : "You don't have any workouts scheduled. Create a workout plan to get started with your fitness journey!"}
                </p>
              </div>
              <div className="flex w-full max-w-sm flex-col gap-3">
                {planStatus?.status === "plan_paused" ? <Button
                  variant="default"
                  className="w-full"
                  onClick={() => router.push("/dashboard/your-plan")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  View Plan
                </Button>
                  :
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleGeneratePlan}
                    disabled={isLoading}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isLoading ? "Creating Plan..." : "Create Workout Plan"}
                  </Button>}
                <Button
                  variant="outline"
                  onClick={() => setIsManualActivityDialogOpen(true)}
                  disabled={isInsertingManualActivity}
                >
                  {isInsertingManualActivity ? "Recording..." : "Record Activity"}
                </Button>
              </div>
            </div>
          ) : (
            (upcomingClasses as (Workout & { tracking: WorkoutTracking | null; weekNumber?: number; mux_playback_id?: string })[]).map((classItem, index) => {
              // Function to get activity image based on type
              const getActivityImage = (activityType: string | null) => {
                return localImages[activityType as keyof typeof localImages] || "/images/workouts/fitness.jpg";
              };

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-brand-white border-b px-4 rounded-lg border-gray-100 py-3 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleUpcomingWorkoutClick(classItem)}
                >
                  {/* Thumbnail */}
                  <div className="flex w-16 h-16 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-brand-sage/10">
                    <Image
                      src={classItem.mux_playback_id
                        ? `https://image.mux.com/${classItem.mux_playback_id}/thumbnail.png?width=128&height=128&fit_mode=smartcrop&time=${classItem.thumbnailTimestamp || 35}`
                        : getActivityImage(classItem.activityType)
                      }
                      alt={`${classItem.activityType || 'fitness'} workout`}
                      className="h-full w-full rounded object-contain"
                      width={64}
                      height={64}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{classItem.name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {classItem.duration} min
                    </p>
                  </div>

                  {/* Right side info */}
                  <div className="flex flex-col items-end gap-2 text-right flex-shrink-0">
                    <p className="text-sm text-gray-500">{classItem.level}</p>
                    <span className="text-accent text-sm font-medium">
                      Week {classItem.weekNumber}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </DefaultBox>
        <DefaultBox
          title="Progress Tracking"
          description="Your progress over the past 30 days"
          showViewAll={false}
        >
          <ProgressSection />
        </DefaultBox>
      </div>


      {/* <DefaultBox
        title="Workout Logging"
        description={`${pastWorkoutsData.workouts.length > 0 ? "Record your workouts" : "No past workouts logged yet"}`}
        showViewAll={false}
      >
        {isLoadingPastWorkouts ? (
          <WorkoutLoggingSkeleton />
        ) : (
          <>
            {pastWorkoutsData.workouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-brand-brown bg-brand-light-nude px-4 py-8 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <Activity className="h-12 w-12 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    No Past Activities
                  </h3>
                  <p className="mb-6 max-w-md text-center text-gray-500">
                    You haven&apos;t recorded any activities yet. Start tracking
                    your fitness journey by recording your workouts!
                  </p>
                </div>
                <Button
                  onClick={() => setIsManualActivityDialogOpen(true)}
                  disabled={isInsertingManualActivity}
                >
                  {isInsertingManualActivity ? "Recording..." : "Record Activity"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {pastWorkoutsData.workouts.map((workout, index) => {
                  // Determine card color and badge
                  let badgeColor = "bg-green-100 text-green-800";
                  let badgeText = "This Week";
                  if (workout.weekNumber && pastWorkoutsData.currentWeek && workout.weekNumber < pastWorkoutsData.currentWeek) {
                    badgeColor = "bg-orange-100 text-orange-800";
                    badgeText = `Catch Up`;
                  }
                  return (
                    <div
                      key={index}
                      className={`flex flex-col rounded-xl  bg-white shadow p-4 transition-all`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center rounded-full bg-gray-100 p-3 shadow-sm">
                          {getStatusIcon(workout.status)}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-lg text-gray-900">{workout.name}</p>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>
                              {badgeText}
                            </span>
                          </div>
                          <div className="flex gap-2 text-sm text-gray-500 mt-1">
                            <span>
                              <Clock className="inline h-4 w-4" /> {workout.duration} min
                            </span>
                            {workout.weekNumber && (
                              <>
                                <span>·</span>
                                <span>Week {workout.weekNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row gap-2 mt-4">
                        <Button
                          className="bg-[#34C759]/90 text-white font-bold hover:bg-[#34C759] w-1/2"
                          onClick={() => handleMarkComplete(workout)}
                          disabled={isInsertingCompletedClass}
                        >
                          {isInsertingCompletedClass ? "Completing..." : "Complete"}
                        </Button>
                        <Button
                          className="bg-[#FF3B30]/80 text-white font-bold hover:bg-[#FF3B30]/90 w-1/2"
                          onClick={() => handleMarkMissed(workout)}
                          disabled={isUpdatingWorkoutStatus}
                        >
                          {isUpdatingWorkoutStatus ? "Marking..." : "Missed"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {pastWorkoutsData.workouts.length > 0 && (
              <Button
                onClick={() => setIsManualActivityDialogOpen(true)}
                variant="default"
                className="w-full"
                disabled={isInsertingManualActivity}
              >
                <Plus className="h-4 w-4" />
                {isInsertingManualActivity
                  ? "Recording..."
                  : "Record Manual Activity"}
              </Button>
            )}
          </>
        )}
      </DefaultBox> */}

      <DefaultBox
        title="Activity History"
        description="Your recent workouts and progress"
        viewAllText="View All Activities"
        viewAllHref="history"
        showViewAll={activityHistory.length > 0}
      >
        {isLoadingActivityHistory ? (
          <ActivityHistorySkeleton />
        ) : activityHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed border-brand-brown bg-gray-50 px-4 py-8 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Flame className="h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">
                No Past Activities
              </h3>
              <p className="mb-6 max-w-md text-center text-gray-500">
                You haven&apos;t recorded any activities yet. Start tracking
                your fitness journey by recording your workouts!
              </p>
            </div>
            <Button
              variant="default"
              className="w-full"
              onClick={() => setIsManualActivityDialogOpen(true)}
              disabled={isInsertingManualActivity}
            >
              {isInsertingManualActivity ? "Recording..." : "Record Activity"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              variant="default"
              className="w-full"
              onClick={() => setIsManualActivityDialogOpen(true)}
              disabled={isInsertingManualActivity}
            >
              <Plus className="mr-2 h-4 w-4" />
              {isInsertingManualActivity ? "Recording..." : "Record Activity"}
            </Button>
            <div className="space-y-0">
              {activityHistory
                .filter((activity) => activity.tracking.name)
                .map((activity, index) => {
                  // Function to get activity image based on type
                  const getActivityImage = (activityType: string | null) => {
                    return localImages[activityType as keyof typeof localImages] || "/images/workouts/fitness.jpg";
                  };

                  const handleActivityClick = () => {
                    if (activity.workout) {
                      if (activity.workout.type === "class") {
                        router.push(`/dashboard/class/${activity.workout.id}`);
                      } else {
                        router.push(`/dashboard/workout/${activity.workout.id}`);
                      }
                    }
                  };

                  return (
                    <div
                      key={activity.tracking.id}
                      className={`flex items-center gap-3 py-3 ${index < activityHistory.filter((a) => a.tracking.name).length - 1
                        ? 'border-b border-gray-200'
                        : ''
                        } ${activity.workout ? 'cursor-pointer hover:bg-gray-50 rounded-lg px-2 mx-[-8px] transition-colors' : ''
                        }`}
                      onClick={activity.workout ? handleActivityClick : undefined}
                    >
                      {/* Thumbnail */}
                      <div className="flex w-16 h-16 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-brand-sage/10">
                        <Image
                          src={activity.workout?.mux_playback_id
                            ? `https://image.mux.com/${activity.workout.mux_playback_id}/thumbnail.png?width=128&height=128&fit_mode=smartcrop&time=${activity.workout.thumbnailTimestamp || 35}`
                            : getActivityImage(activity.tracking.activityType)
                          }
                          alt={`${activity.tracking.activityType || 'fitness'} activity`}
                          className="h-full w-full rounded object-contain"
                          width={64}
                          height={64}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 capitalize">{activity.tracking.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.tracking?.date ?? "").toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>

                      {/* Duration */}
                      <div className="text-right flex-shrink-0">
                        {["run", "cycle", "swim", "walk"].includes(activity.tracking.activityType || "") && activity.tracking.durationHours && activity.tracking.durationMinutes ? (
                          <p className="text-accent font-medium">
                            {activity.tracking.durationHours}h {activity.tracking.durationMinutes}m
                          </p>
                        ) : activity.workout?.duration ? (
                          <p className="text-accent font-medium">
                            {activity.workout.duration} min
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </DefaultBox>

      <MarkClassComplete
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        handleSubmitWorkoutDetails={handleSubmitWorkoutDetails}
        workoutId={selectedWorkout?.id?.toString() ?? ""}
        bookedDate={
          selectedWorkout?.bookedDate
            ? new Date(selectedWorkout.bookedDate)
            : new Date()
        }
        name={selectedWorkout?.name ?? ""}
      />
      <MarkClassMissed
        isDialogOpen={isMarkMissedDialogOpen}
        setIsDialogOpen={setIsMarkMissedDialogOpen}
        onSubmit={handleSubmitMarkMissed}
        workoutId={selectedWorkout?.id?.toString() ?? ""}
      />

      <RecordManualActivity
        isDialogOpen={isManualActivityDialogOpen}
        setIsDialogOpen={setIsManualActivityDialogOpen}
        handleSubmitActivity={handleSubmitManualActivity}
        workoutId={selectedWorkout?.id}
        initialActivityType={selectedWorkout?.activityType ?? undefined}
        initialDurationMinutes={selectedWorkout?.duration ?? undefined}
      />

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
    </div>
  );
}
