'use client'

import ClassRecommendations from "@/app/_components/dashboard/ClassRecommendations"
import Dashboard from "@/app/_components/dashboard/Dashboard"
import WorkoutHistory from "@/app/_components/dashboard/WorkoutHistory"
import PersonalTrainer from "@/app/_components/dashboard/PersonalTrainer"
import Classes from "@/app/_components/dashboard/Classes"

type DashboardTabsProps = {
  tabs: string;
}

export default function DashboardTabs({ tabs }: DashboardTabsProps) {
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
    default:
      return <Dashboard />;
  }
} 