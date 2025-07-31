import { api } from "@/trpc/server";
import { DashboardShell } from "@/components/dashboard/shell";
import { DefaultBox } from "@/components/dashboard/default-box";
import { ProgressTrackingContainer } from "@/components/progress/tracking-container";
import { UpcomingWorkoutsContainer } from "@/components/workouts/upcoming-workouts-container";
import { NutritionOverviewContainer } from "@/components/nutrition/overview-container";
import { ActivityContainer } from "@/components/activity/activity-container";

export default async function DashboardPage() {
  const upcomingWorkouts = await api.workout.upcomingWorkouts.query();
  const progress = await api.progress.getProgress.query();

  return (
    <DashboardShell>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DefaultBox>
          <UpcomingWorkoutsContainer workouts={upcomingWorkouts} />
        </DefaultBox>
        <DefaultBox>
          <ProgressTrackingContainer progress={progress} />
        </DefaultBox>
        <DefaultBox>
          <NutritionOverviewContainer />
        </DefaultBox>
        <DefaultBox>
          <ActivityContainer />
        </DefaultBox>
      </div>
    </DashboardShell>
  );
}