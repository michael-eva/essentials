"use client";

import {
  CalendarDays,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Activity,
} from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import DashboardCardLayout from "./DashboardCardLayout";

import { useState } from "react";
import MarkClassComplete from "./MarkClassComplete";
import type { WorkoutFormValues } from "./MarkClassComplete";
import RecordManualActivity from "./RecordManualActivity";
import type { ActivityFormValues } from "./RecordManualActivity";
import { toast } from "sonner";

import useGeneratePlan from "@/hooks/useGeneratePlan";
import {
  UpcomingClassesSkeleton,
  WorkoutLoggingSkeleton,
  ActivityHistorySkeleton,
} from "./DashboardSkeleton";
import { ProgressSection } from "./ProgressSection";
import MarkClassMissed from "./MarkClassMissed";
import { workoutStatusEnum } from "@essentials/types/src/db";
type WorkoutStatus = (typeof workoutStatusEnum.enumValues)[number];

export default function Dashboard() {
  const utils = api.useUtils();
  const { data: upcomingClasses, isLoading: isLoadingUpcomingClasses } =
    api.workoutPlan.getUpcomingClasses.useQuery();
  const { data: pastWorkouts = [], isLoading: isLoadingPastWorkouts } =
    api.workoutPlan.getWorkoutsToLog.useQuery();
  const { data: activityHistory = [], isLoading: isLoadingActivityHistory } =
    api.workoutPlan.getActivityHistory.useQuery({});
  const { mutate: insertManualActivity, isPending: isInsertingManualActivity } =
    api.workoutPlan.insertManualActivity.useMutation({
      onSuccess: () => {
        void utils.workoutPlan.getActivityHistory.invalidate();
      },
    });
  const { mutate: insertCompletedClass, isPending: isInsertingCompletedClass } =
    api.workoutPlan.insertCompletedClass.useMutation({
      onSuccess: () => {
        void toast.success("Workout details saved successfully");
        void utils.workoutPlan.getWorkoutsToLog.invalidate();
      },
    });
  const { mutate: updateWorkoutStatus, isPending: isUpdatingWorkoutStatus } =
    api.workoutPlan.updateWorkoutStatus.useMutation({
      onSuccess: () => {
        void utils.workoutPlan.getWorkoutsToLog.invalidate();
      },
    });
  const { generatePlan, OnboardingDialog, isLoading, LoadingScreen } = useGeneratePlan();

  const [selectedWorkout, setSelectedWorkout] = useState<
    (typeof pastWorkouts)[0] | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMarkMissedDialogOpen, setIsMarkMissedDialogOpen] = useState(false);
  const [isManualActivityDialogOpen, setIsManualActivityDialogOpen] =
    useState(false);

  const handleMarkComplete = (workout: (typeof pastWorkouts)[0]) => {
    setSelectedWorkout(workout);
    setIsDialogOpen(true);
  };

  const handleMarkMissed = (workout: (typeof pastWorkouts)[0]) => {
    setSelectedWorkout(workout);
    setIsMarkMissedDialogOpen(true);
  };

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
      wouldDoAgain: data.wouldDoAgain === "yes" ? true : false,
      name,
    });

    setIsDialogOpen(false);
    setSelectedWorkout(null);
  };

  const handleSubmitManualActivity = async (data: ActivityFormValues) => {
    setIsManualActivityDialogOpen(false);
    insertManualActivity(data, {
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

  const getStatusIcon = (status: WorkoutStatus | null | undefined) => {
    if (!status) return <Clock className="h-4 w-4 text-yellow-500" />;

    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "not_completed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "not_recorded":
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const handleGeneratePlan = () => {
    generatePlan();
  };

  return (
    <div className="space-y-6">
      {OnboardingDialog}
      <LoadingScreen />
      <DashboardCardLayout
        title="Progress Tracking"
        description="Your progress over the past 7 days"
        showViewAll={false}
      >
        <ProgressSection />
      </DashboardCardLayout>
      <DashboardCardLayout
        title="Upcoming Classes"
        description={
          upcomingClasses && upcomingClasses?.length > 0
            ? "Your scheduled sessions:"
            : "No upcoming classes scheduled"
        }
        viewAllHref="classes"
      >
        {isLoadingUpcomingClasses ? (
          <UpcomingClassesSkeleton />
        ) : !upcomingClasses || upcomingClasses?.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
            <div className="flex flex-col items-center space-y-2">
              <CalendarDays className="h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">
                No Upcoming Classes
              </h3>
              <p className="mb-6 max-w-md text-center text-gray-500">
                You don&apos;t have any classes scheduled. Create a workout plan
                to get started with your fitness journey!
              </p>
            </div>
            <div className="flex w-full max-w-sm flex-col gap-3">
              <Button
                className="bg-accent hover:bg-accent/90 w-full text-white transition-colors"
                onClick={handleGeneratePlan}
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isLoading ? "Creating Plan..." : "Create Workout Plan"}
              </Button>
              <Button
                variant="outline"
                className="text-accent w-full border-gray-200 transition-colors hover:bg-gray-50"
                onClick={() => setIsManualActivityDialogOpen(true)}
                disabled={isInsertingManualActivity}
              >
                {isInsertingManualActivity ? "Recording..." : "Record Activity"}
              </Button>
            </div>
          </div>
        ) : (
          upcomingClasses.map((classItem, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium text-gray-900">{classItem.name}</p>
                <p className="text-sm text-gray-500">
                  {classItem.instructor} • {classItem.duration} min
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                <p className="text-sm text-gray-500">{classItem.level}</p>
                <span className="text-accent text-sm font-medium">
                  Booked for{" "}
                  {new Date(classItem.bookedDate ?? "").toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </span>
                <button className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-200">
                  Manage Booking
                </button>
              </div>
            </div>
          ))
        )}
      </DashboardCardLayout>

      <DashboardCardLayout
        title="Workout Logging"
        description={`${pastWorkouts.length > 0 ? "Record your past workouts" : "No past workouts logged yet"}`}
        showViewAll={false}
      >
        {isLoadingPastWorkouts ? (
          <WorkoutLoggingSkeleton />
        ) : (
          <>
            {pastWorkouts.length > 0 && (
              <Button
                onClick={() => setIsManualActivityDialogOpen(true)}
                className="bg-accent hover:bg-accent/90 flex w-full items-center gap-2 text-white transition-colors"
                disabled={isInsertingManualActivity}
              >
                <Plus className="h-4 w-4" />
                {isInsertingManualActivity
                  ? "Recording..."
                  : "Record Manual Activity"}
              </Button>
            )}
            {pastWorkouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
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
                  variant="outline"
                  className="text-accent w-full max-w-sm border-gray-200 transition-colors hover:bg-gray-50"
                  onClick={() => setIsManualActivityDialogOpen(true)}
                  disabled={isInsertingManualActivity}
                >
                  {isInsertingManualActivity
                    ? "Recording..."
                    : "Record Activity"}
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {pastWorkouts.map((workout, index) => (
                  <div
                    key={index}
                    className="flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center rounded-full bg-white p-2 shadow-sm">
                        {getStatusIcon(workout.status)}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {workout.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {workout.instructor} &bull; {workout.duration} min
                        </p>
                        <p className="text-sm text-gray-500">
                          Booked for{" "}
                          {new Date(
                            workout.bookedDate ?? "",
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3 self-end">
                      <Button
                        className="bg-[#34C759] text-white transition-colors hover:bg-[#34C759]/90"
                        onClick={() => handleMarkComplete(workout)}
                        disabled={isInsertingCompletedClass}
                      >
                        {isInsertingCompletedClass
                          ? "Marking..."
                          : "Mark Complete"}
                      </Button>
                      <Button
                        className="bg-[#FF3B30] text-white transition-colors hover:bg-[#FF3B30]/90"
                        onClick={() => handleMarkMissed(workout)}
                        disabled={isUpdatingWorkoutStatus}
                      >
                        {isUpdatingWorkoutStatus ? "Marking..." : "Mark Missed"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </DashboardCardLayout>

      <DashboardCardLayout
        title="Activity History"
        description="Your recent workouts and progress"
        viewAllText="View All Activities"
        viewAllHref="history"
        showViewAll={activityHistory.length > 0}
      >
        {isLoadingActivityHistory ? (
          <ActivityHistorySkeleton />
        ) : activityHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
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
              variant="outline"
              className="text-accent w-full max-w-sm border-gray-200 transition-colors hover:bg-gray-50 bg-brand-amber"
              onClick={() => setIsManualActivityDialogOpen(true)}
              disabled={isInsertingManualActivity}
            >
              {isInsertingManualActivity ? "Recording..." : "Record Activity"}
            </Button>
          </div>
        ) : (
          activityHistory
            .filter((activity) => activity.name)
            .map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{activity.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity?.date ?? "").toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
                <div className="text-right">
                  {activity.activityType === "workout" && activity.durationHours && activity.durationMinutes ? (
                    <p className="text-accent font-medium">
                      {activity.durationHours}h {activity.durationMinutes}m
                    </p>
                  ) : (
                    null
                  )}
                </div>
              </div>
            ))
        )}
      </DashboardCardLayout>

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
      />
    </div>
  );
}
