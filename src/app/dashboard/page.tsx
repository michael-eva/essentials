import { DashboardLayout } from "@/app/dashboard/_components/dashboard-layout";
import { DefaultBox } from "@/components/ui/default-box";
import { getServerSession } from "@/lib/auth";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { ProgressTrackingBox } from "./_components/progress-tracking-box";
import { RecentWorkoutsSummaryBox } from "./_components/recent-workouts-summary-box";
import { UpcomingWorkoutsBox } from "./_components/upcoming-workouts-box";
import { WelcomeMessageBox } from "./_components/welcome-message-box";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/");

  const { user } = session;

  return (
    <DashboardLayout>
      <WelcomeMessageBox name={user.name} />
      <DefaultBox>
        <RecentWorkoutsSummaryBox />
      </DefaultBox>
      <DefaultBox>
        <UpcomingWorkoutsBox />
      </DefaultBox>
      <DefaultBox>
        <ProgressTrackingBox />
      </DefaultBox>
    </DashboardLayout>
  );
}