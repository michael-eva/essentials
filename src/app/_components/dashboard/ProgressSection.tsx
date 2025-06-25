import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/trpc/react";
import { Trophy, TrendingUp, Clock, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ProgressSection() {
  const { data: progressData, isLoading } = api.personalTrainer.getLatestProgress.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px] mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
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

  const metrics = progressData.metrics as {
    duration: number;
    intensity: number;
    consistency: number;
    completionRate: number;
    workoutCount: number;
  };
  return (
    <div className="grid gap-4 grid-cols-2">
      <Card className="bg-brand-light-nude shadow-xl border-brand-brown">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">
              Consistency
            </CardTitle>
          </div>
          <div className="w-5 h-5 flex items-start justify-center">
            <TrendingUp className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold"> {Math.round(metrics.consistency * 100)}%</div>
          <Progress value={metrics.consistency * 100} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-brand-light-nude shadow-xl border-brand-brown">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">
              Intensity
            </CardTitle>
          </div>
          <div className="w-5 h-5 flex items-start justify-center">
            <Activity className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold"> {Math.round(metrics.intensity)}/10</div>
          <Progress value={metrics.intensity * 10} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-brand-light-nude shadow-xl border-brand-brown">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">
              Duration
            </CardTitle>
          </div>
          <div className="w-5 h-5 flex items-start justify-center">
            <Clock className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold"> {Math.round(metrics.duration)} min</div>
          <Progress value={(metrics.duration / 60) * 100} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-brand-light-nude shadow-xl border-brand-brown">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
          </div>
          <div className="w-5 h-5 flex items-start justify-center">
            <Trophy className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold"> {Math.round(metrics.completionRate * 100)}%</div>
          <Progress value={metrics.completionRate * 100} className="mt-2" />
        </CardContent>
      </Card>

      {/* <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {achievements.map((achievement, index) => (
              <li key={index} className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>{achievement}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {challenges.map((challenge, index) => (
              <li key={index} className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span>{challenge}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card> */}
    </div>
  );
} 