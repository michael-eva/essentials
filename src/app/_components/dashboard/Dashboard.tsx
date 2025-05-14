"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Flame, TrendingUp, CheckCircle2, XCircle, Clock, Plus } from "lucide-react"
import { api } from "@/trpc/react"
import { type WorkoutStatus } from "@/data/workouts"
import { Button } from "@/components/ui/button"

import { useState } from "react"
import RecordWorkout, { type WorkoutFormValues } from "./RecordWorkout"
import RecordManualActivity, { type ActivityFormValues } from "./RecordManualActivity"
import toast from "react-hot-toast"

export default function Dashboard() {
  const { data: upcomingClasses = [] } = api.workoutPlan.getUpcomingClasses.useQuery()

  const { data: pastWorkouts = [] } = api.workoutPlan.getWorkoutsToLog.useQuery()
  const { data: activityHistory = [] } = api.workoutPlan.getActivityHistory.useQuery()

  const [selectedWorkout, setSelectedWorkout] = useState<typeof pastWorkouts[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isManualActivityDialogOpen, setIsManualActivityDialogOpen] = useState(false)

  const handleMarkComplete = (workout: typeof pastWorkouts[0]) => {
    setSelectedWorkout(workout)
    setIsDialogOpen(true)
  }

  const handleSubmitWorkoutDetails = (workoutId: string, data: WorkoutFormValues) => {
    // TODO: Implement the API call to save workout details
    console.log({
      workoutId,
      data
    })
    setIsDialogOpen(false)
    setSelectedWorkout(null)
    toast.success("Workout details saved successfully")
  }

  const handleSubmitManualActivity = (data: ActivityFormValues) => {
    // TODO: Implement the API call to save manual activity
    console.log("Manual activity data:", data)
    setIsManualActivityDialogOpen(false)
    toast.success("Activity recorded successfully")
  }

  const getStatusIcon = (status: WorkoutStatus | undefined) => {
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Classes</CardTitle>
          <CardDescription>Your scheduled sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingClasses.length > 0 ? (
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
                      Booked for {new Date(classItem.bookedDate).toLocaleDateString('en-US', {
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
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming classes scheduled</p>
            )}
            <div className="pt-2">
              <a href="#" className="text-sm text-secondary hover:text-secondary/80 font-medium flex items-center">
                View All Classes
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {pastWorkouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workout Logging</CardTitle>
            <Button
              onClick={() => setIsManualActivityDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Record Manual Activity
            </Button>
            <CardDescription>Record your past workouts</CardDescription>
          </CardHeader>
          <CardContent>
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
                        Booked for {new Date(workout.bookedDate).toLocaleDateString('en-US', {
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
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Activity History</CardTitle>
            <CardDescription>Your recent workouts and progress</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityHistory
              .filter(activity => activity.workout)
              .map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{activity.workout?.name}</p>
                    <p className="text-sm text-muted-foreground">{new Date(activity.workout?.dateLogged ?? '').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{activity.workout?.timeLogged} min</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

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
        workoutId={selectedWorkout?.id ?? ""}
      />

      <RecordManualActivity
        isDialogOpen={isManualActivityDialogOpen}
        setIsDialogOpen={setIsManualActivityDialogOpen}
        handleSubmitActivity={handleSubmitManualActivity}
      />
    </div>
  )
}
