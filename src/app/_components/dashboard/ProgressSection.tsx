import { Progress } from "@/components/ui/progress";
import { api } from "@/trpc/react";
import { Trophy, TrendingUp, Clock, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Span } from "next/dist/trace";

interface ProgressMetricBoxProps {
  icon: LucideIcon;
  title: string;
  value: number;
  maxValue?: number;
  unit?: string;
  showProgress?: boolean;
  customContent?: React.ReactNode;
}

function ProgressMetricBox({
  icon: Icon,
  title,
  value,
  maxValue = 100,
  unit = "",
  showProgress = true,
  customContent
}: ProgressMetricBoxProps) {
  return (
    <div className="rounded-2xl border border-brand-brown bg-brand-light-nude shadow-xl flex flex-col items-center px-4 py-5 min-h-[140px]">
      <div className="flex flex-col items-center mb-2">
        <Icon className="h-8 w-8 text-brand-brown/30 mb-2" />
        <span className="text-sm font-medium text-brand-brown">{title}</span>
      </div>
      <div className="flex flex-col items-center justify-center w-full flex-1">
        {customContent || (
          <>
            <div className="text-2xl font-bold mb-1">
              {Math.round(value)}{unit}
            </div>
            {showProgress && (
              <Progress value={(value / maxValue) * 100} className="mt-1 w-full" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function ProgressSection() {
  const { data: progressData, isLoading } = api.personalTrainer.getLatestProgress.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-brand-brown bg-brand-light-nude shadow-xl flex flex-col items-center px-4 py-5 min-h-[140px]">
            <div className="flex flex-col items-center mb-2 w-full">
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="flex flex-col items-center w-full flex-1">
              <Skeleton className="h-8 w-[80px] mb-2" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Activity className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Progress Data Yet</h3>
        <p className="text-muted-foreground">
          Start your fitness journey by completing your first workout to see your progress metrics.
        </p>
      </div>
    );
  }
  const metrics = progressData as {
    duration: number;
    intensity: number;
    workout_count: number;
    achievements: {
      num_achievements: number;
      achievements: (string | null)[];
    };
  };

  return (
    <div className="grid gap-4 grid-cols-2">
      <ProgressMetricBox
        icon={TrendingUp}
        title="Workout Count"
        value={metrics.workout_count}
        maxValue={100}
      />

      <ProgressMetricBox
        icon={Activity}
        title="Intensity"
        value={metrics.intensity}
        maxValue={10}
        unit="/10"
      />

      <ProgressMetricBox
        icon={Clock}
        title="Duration"
        value={metrics.duration}
        maxValue={60}
        unit=" min"
      />

      <ProgressMetricBox
        icon={Trophy}
        title="Achievements"
        value={metrics.achievements.num_achievements}
        maxValue={10}
        customContent={
          metrics.achievements.num_achievements > 0 ? (
            <>
              <div className="text-2xl font-bold mb-1">{metrics.achievements.num_achievements}</div>
              <Progress value={metrics.achievements.num_achievements} className="mt-1 w-full" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center w-full py-2">
              <span className="text-xs text-muted-foreground font-medium text-center">
                No achievements yet<br />
                <span className="text-brand-brown font-semibold">Keep showing up!</span>
              </span>
            </div>
          )
        }
      />
    </div>
  );
} 