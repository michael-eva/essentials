'use client'
import ClassRecommendations from "@/app/_components/dashboard/ClassRecommendations"
import Dashboard from "@/app/_components/dashboard/Dashboard"
import WorkoutHistory from "@/app/_components/dashboard/WorkoutHistory"
import { use } from "react"

type PageProps = {
  params: Promise<{
    tabs: string;
  }>;
}

export default function Home({ params }: PageProps) {
  const { tabs } = use(params);

  switch (tabs) {
    case 'overview':
      return <Dashboard />;
    case 'your-plan':
      return <ClassRecommendations />;
    case 'history':
      return <WorkoutHistory />;
    default:
      return <Dashboard />;
  }


}
