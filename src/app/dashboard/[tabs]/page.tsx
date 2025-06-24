'use client'
import ClassRecommendations from "@/app/_components/dashboard/YourPlan"
import Dashboard from "@/app/_components/dashboard/Dashboard"
import WorkoutHistory from "@/app/_components/dashboard/WorkoutHistory"
import PersonalTrainer from "@/app/_components/dashboard/PersonalTrainer"
import { use } from "react"
import Classes from "@/app/_components/dashboard/Classes"
import type { Tab } from "../layout"
import Profile from "@/app/_components/dashboard/Profile"

type PageProps = {
  params: Promise<{
    tabs: Tab;
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
    case 'mypt':
      return <PersonalTrainer />;
    case 'classes':
      return <Classes />;
    case 'profile':
      return <Profile />;
    default:
      return <Dashboard />;
  }


}
