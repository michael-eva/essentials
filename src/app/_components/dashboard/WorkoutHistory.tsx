"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Activity, BarChart3, CalendarDays, Clock, Bike, Footprints, Mountain, Waves, Plus } from "lucide-react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import RecordManualActivity, { type ActivityFormValues } from "./RecordManualActivity"
import { toast } from "sonner"

// Map activity types to icons
const activityTypeIcons: Record<string, React.ReactNode> = {
  Running: <Activity className="h-5 w-5 text-[#007AFF]" />,
  Cycling: <Bike className="h-5 w-5 text-[#007AFF]" />,
  Swimming: <Waves className="h-5 w-5 text-[#007AFF]" />,
  Walking: <Footprints className="h-5 w-5 text-[#007AFF]" />,
  Hiking: <Mountain className="h-5 w-5 text-[#007AFF]" />,
  Rowing: <Activity className="h-5 w-5 text-[#007AFF]" />,
  Elliptical: <Activity className="h-5 w-5 text-[#007AFF]" />,
}

export default function WorkoutHistory() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [page, setPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [allActivities, setAllActivities] = useState<typeof activityHistory>([])
  const utils = api.useUtils();
  const ITEMS_PER_PAGE = 10

  const { data: activityHistory = [], isLoading } = api.workoutPlan.getActivityHistory.useQuery({
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE
  })

  const { data: totalCount = 0 } = api.workoutPlan.getActivityHistoryCount.useQuery()
  const { mutate: insertManualActivity } = api.workoutPlan.insertManualActivity.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivityHistory.invalidate();
    }
  })

  // Update allActivities when new data comes in
  useEffect(() => {
    if (activityHistory.length > 0) {
      setAllActivities(prev => {
        // If it's the first page, replace the array
        if (page === 1) return activityHistory
        // Otherwise append the new activities
        return [...prev, ...activityHistory]
      })
    }
  }, [activityHistory, page])

  const hasMore = allActivities.length < totalCount

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  const formatDuration = (hours: number | null, minutes: number | null) => {
    const totalHours = hours ?? 0
    const totalMinutes = minutes ?? 0
    if (totalHours === 0) return `${totalMinutes} min`
    if (totalMinutes === 0) return `${totalHours} hr`
    return `${totalHours} hr ${totalMinutes} min`
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const workoutDate = new Date(date)
    const diffTime = Math.abs(now.getTime() - workoutDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return `Today, ${workoutDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    if (diffDays === 1) return `Yesterday, ${workoutDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    return workoutDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  }
  const handleSubmitManualActivity = async (data: ActivityFormValues) => {
    insertManualActivity(data)
    setIsDialogOpen(false)
    toast.success("Activity recorded successfully")
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        {allActivities.length === 0 && !isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-lg border border-gray-100"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Workouts Yet</h2>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              You haven&apos;t recorded any workouts yet. Start tracking your fitness journey by recording your first workout!
            </p>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              className="border-gray-200 text-accent hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Workout
            </Button>
          </motion.div>
        ) : (
          <Tabs defaultValue="list" className="w-full">
            <TabsContent value="list" className="space-y-4">
              {allActivities.map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all">
                    <div className="p-4">
                      {/* Top row: Icon, Title, Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#007AFF]/10">
                            {activityTypeIcons[workout.name!] ?? <Activity className="h-5 w-5 text-[#007AFF]" />}
                          </div>
                          <span className="font-semibold text-gray-900">{workout.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${workout.activityType === "class"
                            ? "bg-[#5856D6]/10 text-[#5856D6] border-0"
                            : "bg-[#34C759]/10 text-[#34C759] border-0"
                            } text-xs font-medium px-3 py-1 rounded-full`}
                        >
                          {workout.activityType}
                        </Badge>
                      </div>

                      {/* Meta info row */}
                      <div className="flex flex-wrap items-center gap-4 text-sm mt-3">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Clock className="h-4 w-4" />
                          {formatDuration(workout.durationHours, workout.durationMinutes)}
                        </div>
                        {workout.distance && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                            {workout.distance} {workout.distanceUnit}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(workout.date)}
                        </div>
                      </div>

                      {/* Notes section */}
                      {workout.notes && (
                        <div className="mt-3 text-sm text-gray-500">
                          <p className="line-clamp-2">{workout.notes}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    className="w-full border-gray-200 text-[#007AFF] hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "See More"}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar">
              <div className="flex flex-col items-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-xl border border-gray-100 w-full max-w-[350px] shadow-sm"
                />

                <div className="w-full mt-6">
                  <h3 className="font-medium text-gray-900 mb-3 px-1">
                    {date
                      ? date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "Select a date"}
                  </h3>

                  {date && (
                    <div className="space-y-3">
                      {allActivities
                        .filter(workout => {
                          const workoutDate = new Date(workout.date)
                          return workoutDate.toDateString() === date.toDateString()
                        })
                        .map(workout => (
                          <Card key={workout.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{workout.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(workout.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} • {formatDuration(workout.durationHours, workout.durationMinutes)}
                                  </p>
                                </div>
                                <Badge
                                  className={`${workout.activityType === "class"
                                    ? "bg-[#5856D6]/10 text-[#5856D6] border-0"
                                    : "bg-[#34C759]/10 text-[#34C759] border-0"
                                    } text-xs font-medium px-3 py-1 rounded-full`}
                                >
                                  {workout.activityType}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
      <RecordManualActivity
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        handleSubmitActivity={handleSubmitManualActivity}
      />
    </motion.div>
  )
}
