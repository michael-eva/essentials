"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Flame, TrendingUp, CheckCircle2, XCircle, Clock, Plus } from "lucide-react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import DashboardCardLayout from "./DashboardCardLayout"

import { useState } from "react"
import RecordWorkout from "./RecordWorkout"
import type { WorkoutFormValues } from "./RecordWorkout"
import RecordManualActivity from "./RecordManualActivity"
import type { ActivityFormValues } from "./RecordManualActivity"
import toast from "react-hot-toast"
import { workoutStatusEnum } from "@/drizzle/src/db/schema"
import { useRouter } from "next/navigation"
import useGeneratePlan from "@/hooks/useGeneratePlan"
type WorkoutStatus = typeof workoutStatusEnum.enumValues[number]

export default function Dashboard() {
  const utils = api.useUtils();
  const { data: upcomingClasses } = api.workoutPlan.getUpcomingClasses.useQuery()
  const { data: pastWorkouts = [] } = api.workoutPlan.getWorkoutsToLog.useQuery()
  const { data: activityHistory = [] } = api.workoutPlan.getActivityHistory.useQuery()
  const { mutate: insertManualActivity } = api.workoutPlan.insertManualActivity.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivityHistory.invalidate();
    }
  })
  const { mutate: insertCompletedClass } = api.workoutPlan.insertCompletedClass.useMutation({
    onSuccess: () => {
      void toast.success("Workout details saved successfully");
      void utils.workoutPlan.getWorkoutsToLog.invalidate();
    }
  })
  const { generatePlan } = useGeneratePlan();

  const router = useRouter()

  const [selectedWorkout, setSelectedWorkout] = useState<typeof pastWorkouts[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isManualActivityDialogOpen, setIsManualActivityDialogOpen] = useState(false)

  const handleMarkComplete = (workout: typeof pastWorkouts[0]) => {
    setSelectedWorkout(workout)
    setIsDialogOpen(true)
  }

  const handleSubmitWorkoutDetails = (workoutId: string, data: WorkoutFormValues, bookedDate: Date, name: string) => {
    insertCompletedClass({
      workoutId,
      activityType: "class",
      date: bookedDate,
      notes: data.notes,
      ratings: data.ratings,
      wouldDoAgain: data.wouldDoAgain === "yes" ? true : false,
      name
    })

    setIsDialogOpen(false)
    setSelectedWorkout(null)
  }

  const handleSubmitManualActivity = async (data: ActivityFormValues) => {
    insertManualActivity(data)
    setIsManualActivityDialogOpen(false)
    toast.success("Activity recorded successfully")
  }

  const getStatusIcon = (status: WorkoutStatus | null | undefined) => {
    if (!status) return <Clock className="h-4 w-4 text-yellow-500" />

    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'not_completed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'not_recorded':
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-4">
      <DashboardCardLayout
        title="Upcoming Classes"
        description={upcomingClasses ? "Your scheduled sessions:" : "No upcoming classes scheduled"}
      >
        {!upcomingClasses ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4 bg-muted/50 rounded-lg border border-dashed">
            <div className="flex flex-col items-center space-y-2">
              <CalendarDays className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No Upcoming Classes</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                You don&apos;t have any classes scheduled. Create a workout plan to get started with your fitness journey!
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <Button
                className="w-full"
                onClick={() => generatePlan()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workout Plan
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsManualActivityDialogOpen(true)}
              >
                Record Activity
              </Button>
            </div>
          </div>
        ) : (
          upcomingClasses.map((classItem, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-medium">{classItem.name}</p>
                <p className="text-sm text-muted-foreground">
                  {classItem.instructor} • {classItem.duration} min
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <p className="text-sm text-muted-foreground">{classItem.level}</p>
                <span className="text-sm text-green-600 font-medium">
                  Booked for {new Date(classItem.bookedDate ?? '').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <button
                  className="text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1 rounded-md transition-colors"
                // onClick={() => { }}
                >
                  Manage Booking
                </button>
              </div>
            </div>
          ))
        )}
      </DashboardCardLayout>


      <DashboardCardLayout
        title="Workout Logging"
        description="Record your past workouts"
        showViewAll={false}
      >
        <Button
          onClick={() => setIsManualActivityDialogOpen(true)}
          className="flex items-center gap-2 w-full"
        >
          <Plus className="h-4 w-4" />
          Record Manual Activity
        </Button>
        {pastWorkouts.length > 0 && (<CardContent>
          <div className="space-y-4">
            {pastWorkouts.map((workout, index) => (
              <div
                key={index}
                className="flex flex-col bg-muted/50 rounded-lg p-4 shadow-sm border transition hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center bg-yellow-100 rounded-full p-2">
                    {getStatusIcon(workout.status)}
                  </span>
                  <div>
                    <p className="font-bold text-base">{workout.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {workout.instructor} &bull; {workout.duration} min
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Booked for {new Date(workout.bookedDate ?? '').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6 self-end">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleMarkComplete(workout)}
                  >
                    Mark Complete
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                  // onClick={() => { }}
                  >
                    Mark Missed
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        )}
      </DashboardCardLayout>
      <DashboardCardLayout
        title="Activity History"
        description="Your recent workouts and progress"
        viewAllText="View All Activities"
        viewAllHref="history"
      >
        {activityHistory
          .filter(activity => activity.name)
          .map((activity, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-medium">{activity.name}</p>
                <p className="text-sm text-muted-foreground">{new Date(activity?.date ?? '').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}</p>
              </div>
              <div className="text-right">
                {activity.activityType === "workout" && <p className="font-medium">{activity.durationHours}h {activity.durationMinutes}m</p>}
              </div>
            </div>
          ))}
      </DashboardCardLayout>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Health Summary</CardTitle>
          <CardDescription>Your stats for the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm">Average Steps</span>
              </div>
              <span className="font-medium">8,742</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Flame className="h-4 w-4 mr-2 text-orange-500" />
                <span className="text-sm">Avg. Calories Burned</span>
              </div>
              <span className="font-medium">1,842</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />
                <span className="text-sm">Active Days</span>
              </div>
              <span className="font-medium">5/7</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <RecordWorkout
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        handleSubmitWorkoutDetails={handleSubmitWorkoutDetails}
        workoutId={selectedWorkout?.id?.toString() ?? ""}
        bookedDate={selectedWorkout?.bookedDate ? new Date(selectedWorkout.bookedDate) : new Date()}
        name={selectedWorkout?.name ?? ""}
      />

      <RecordManualActivity
        isDialogOpen={isManualActivityDialogOpen}
        setIsDialogOpen={setIsManualActivityDialogOpen}
        handleSubmitActivity={handleSubmitManualActivity}
      />
    </div>
  )
}
