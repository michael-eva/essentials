'use client'
import ClassRecommendations from "@/app/_components/dashboard/ClassRecommendations"
import Dashboard from "@/app/_components/dashboard/Dashboard"
import WorkoutHistory from "@/app/_components/dashboard/WorkoutHistory"
import { use } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type PageProps = {
  params: Promise<{
    tabs: string;
  }>;
}

export default function Home({ params }: PageProps) {
  const { tabs } = use(params);

  const renderContent = () => {
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
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-6 md:max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Health Tracker</h1>

      <div className="w-full">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-8 w-full">
          <Link
            href={`/dashboard/overview`}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              tabs === 'overview' ? "bg-background text-foreground shadow-sm" : "hover:bg-background hover:text-foreground"
            )}
          >
            Dashboard
          </Link>
          <Link
            href={`/dashboard/your-plan`}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              tabs === 'your-plan' ? "bg-background text-foreground shadow-sm" : "hover:bg-background hover:text-foreground"
            )}
          >
            Your Plan
          </Link>
          <Link
            href={`/dashboard/history`}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              tabs === 'history' ? "bg-background text-foreground shadow-sm" : "hover:bg-background hover:text-foreground"
            )}
          >
            History
          </Link>
        </div>

        {renderContent()}
      </div>
    </div>
  )
}
