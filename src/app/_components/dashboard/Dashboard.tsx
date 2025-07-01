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
  WorkoutLoggingSkeleton,
  ActivityHistorySkeleton,
} from "./DashboardSkeleton";
import { ProgressSection } from "./ProgressSection";
import MarkClassMissed from "./MarkClassMissed";
import { useRouter } from "next/navigation";
import type { Workout, WorkoutTracking } from "@/drizzle/src/db/queries";
type WorkoutStatus = (typeof workoutStatusEnum.enumValues)[number];

export default function Dashboard() {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: upcomingClasses, isLoading: isLoadingUpcomingClasses } =
    api.workoutPlan.getUpcomingActivities.useQuery();
  const { data: pastWorkoutsData = { workouts: [], currentWeek: undefined }, isLoading: isLoadingPastWorkouts } =
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
    (typeof pastWorkoutsData.workouts)[0] | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMarkMissedDialogOpen, setIsMarkMissedDialogOpen] = useState(false);
  const [isManualActivityDialogOpen, setIsManualActivityDialogOpen] =
    useState(false);

  // Helper function to check if we have workouts or a status
  const hasWorkouts = Array.isArray(upcomingClasses) && upcomingClasses.length > 0;
  const planStatus = !Array.isArray(upcomingClasses) ? upcomingClasses : null;

  const handleMarkComplete = (workout: (typeof pastWorkoutsData.workouts)[0]) => {
    setSelectedWorkout(workout);
    setIsDialogOpen(true);
  };

  const handleMarkMissed = (workout: (typeof pastWorkoutsData.workouts)[0]) => {
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
      likelyToDoAgain: data.likelyToDoAgain,
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
    generatePlan({});
  };
  const handleActivityClick = (activity: Workout) => {
    if (activity.type === "class") {
      router.push(`/dashboard/class/${activity.id}`);
    } else {
      router.push(`/dashboard/workout/${activity.id}`);
    }
  }

  // Helper function to get week display text
  const getWeekDisplayText = (workout: (typeof pastWorkoutsData.workouts)[0]) => {
    if (!workout.weekNumber || !pastWorkoutsData.currentWeek) {
      return "Workout to log";
    }

    if (workout.weekNumber === pastWorkoutsData.currentWeek) {
      return "Workout for this week";
    } else if (workout.weekNumber < pastWorkoutsData.currentWeek) {
      return `Catch up from Week ${workout.weekNumber}`;
    } else {
      return `Week ${workout.weekNumber} workout`;
    }
  };
  const handleUpcomingWorkoutClick = (workout: Workout) => {
    if (workout.type === "class") {
      router.push(`/dashboard/class/${workout.id}`);
    } else {
      router.push(`/dashboard/workout/${workout.id}`);
    }
  }
  return (
    <div className="space-y-6">
      {OnboardingDialog}
      <LoadingScreen />
      <DefaultBox
        title="Progress Tracking"
        description="Your progress over the past 30 days"
        showViewAll={false}
      >
        <ProgressSection />
      </DefaultBox>
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
          (upcomingClasses as (Workout & { tracking: WorkoutTracking | null; weekNumber?: number })[]).map((classItem, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-brand-white border-b px-4 rounded-lg border-gray-100 py-3 last:border-0 last:pb-0"
              onClick={() => handleUpcomingWorkoutClick(classItem)}
            >
              <div>
                <p className="font-medium text-gray-900">{classItem.name}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {classItem.duration} min
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                <p className="text-sm text-gray-500">{classItem.level}</p>
                <span className="text-accent text-sm font-medium">
                  Week {classItem.weekNumber}
                </span>
              </div>
            </div>
          ))
        )}
      </DefaultBox>

      <DefaultBox
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
      </DefaultBox>

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
          activityHistory
            .filter((activity) => activity.tracking.name)
            .map((activity, index) => (
              <div
                key={activity.tracking.id}
                className="flex items-center justify-between border-b border-brand-brown pb-3 last:border-0 last:pb-0"
              >
                <div>
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
                <div className="text-right">
                  {activity.tracking.activityType === "workout" && activity.tracking.durationHours && activity.tracking.durationMinutes ? (
                    <p className="text-accent font-medium">
                      {activity.tracking.durationHours}h {activity.tracking.durationMinutes}m
                    </p>
                  ) : (
                    null
                  )}
                </div>
              </div>
            ))
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
      />
    </div>
  );
}
