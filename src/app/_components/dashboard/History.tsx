"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Activity, BarChart3, CalendarDays, Clock, Bike, Footprints, Mountain, Waves, Plus, MapPin, Dumbbell, ChevronDown, ChevronUp } from "lucide-react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import RecordManualActivity, { type ActivityFormValues } from "./RecordManualActivity"
import { toast } from "sonner"
import { HistorySkeleton } from "./DashboardSkeleton"

// Map activity types to icons
const activityTypeIcons: Record<string, React.ReactNode> = {
  run: <Activity className="h-5 w-5 text-brand-light-nude" />,
  cycle: <Bike className="h-5 w-5 text-brand-light-nude" />,
  swim: <Waves className="h-5 w-5 text-brand-light-nude" />,
  walk: <Footprints className="h-5 w-5 text-brand-light-nude" />,
  hike: <Mountain className="h-5 w-5 text-brand-light-nude" />,
  rowing: <Activity className="h-5 w-5 text-brand-light-nude" />,
  elliptical: <Activity className="h-5 w-5 text-brand-light-nude" />,
  workout: <Dumbbell className="h-5 w-5 text-brand-light-nude" />,
}

export default function WorkoutHistory() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [page, setPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [allActivities, setAllActivities] = useState<typeof activityHistory>([])
  const utils = api.useUtils();
  const ITEMS_PER_PAGE = 10

  const { data: activityHistory = [], isLoading } = api.workoutPlan.getActivityHistoryWithProgress.useQuery({
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

  // Accordion for exercises
  const ExerciseAccordion = ({ exercises }: {
    exercises?: Array<{
      id: string;
      name: string;
      sets?: Array<{
        id: string;
        reps: number;
        weight?: number;
      }>;
    }>
  }) => {
    console.log(exercises)
    const [expanded, setExpanded] = useState(false);
    if (!exercises || exercises.length === 0) return null;
    return (
      <div className="w-full">
        <button
          className="flex items-center gap-1 text-xs text-blue-600 font-medium focus:outline-none hover:underline"
          onClick={() => setExpanded((v) => !v)}
          type="button"
        >
          Exercises: {exercises.length} {exercises.length === 1 ? "exercise" : "exercises"}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expanded && (
          <ul className="mt-2 ml-2 space-y-1 text-xs text-gray-700">
            {exercises.map((ex) => (
              <li key={ex.id}>
                <span className="font-semibold">{ex.name}</span>
                {ex.sets && ex.sets.length > 0 && (
                  <ul className="ml-3 list-disc">
                    {ex.sets.map((set, idx) => (
                      <li key={set.id}>
                        Set {idx + 1}: {set.reps} reps{set.weight !== undefined ? ` @ ${set.weight}kg` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Helper for notes icon
  const NotesIcon = ({ notes }: { notes?: string }) => {
    if (!notes) return null;
    return (
      <span title={notes} className="ml-2 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </span>
    );
  };

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
        {isLoading ? (
          <HistorySkeleton />
        ) : allActivities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-brand-brown bg-brand-light-nude px-4 py-8 text-center"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Workouts Yet</h2>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              You haven&apos;t recorded any workouts yet. Start tracking your fitness journey by recording your first workout!
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Workout
            </Button>
          </motion.div>
        ) : (
          <Tabs defaultValue="list" className="w-full">
            <TabsContent value="list" className="space-y-4">
              {allActivities.map((item, index) => {
                const { tracking, workout, progress } = item;
                return (
                  <motion.div
                    key={tracking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden border border-brand-brown bg-brand-light-nude rounded-xl shadow-sm hover:shadow-md transition-all">
                      <div className="px-4">
                        <div className="flex flex-col gap-2">
                          {/* Top row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-nude">
                                {activityTypeIcons[tracking.name!] ?? <Activity className="h-5 w-5 text-brand-light-nude" />}
                              </div>
                              <span className="text-lg font-bold text-brand-brown">{tracking.name ? tracking.name.charAt(0).toUpperCase() + tracking.name.slice(1) : 'Unknown'}</span>
                            </div>
                            <Badge className="ml-2">{tracking.activityType}</Badge>
                          </div>

                          {/* Meta info row */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <CalendarDays className="h-4 w-4" />
                            {formatDate(tracking.date)}
                            {tracking.distance && (
                              <>
                                <span>·</span>
                                <MapPin className="h-4 w-4" />
                                {tracking.distance} {tracking.distanceUnit}
                              </>
                            )}
                            {(!!tracking.durationHours || !!tracking.durationMinutes) && (
                              <>
                                <span>·</span>
                                <Clock className="h-4 w-4" />
                                {formatDuration(tracking.durationHours ?? 0, tracking.durationMinutes ?? 0)}
                              </>
                            )}
                          </div>

                          {/* Details row */}
                          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-700 mt-1">
                            {tracking.exercises && tracking.exercises.length > 0 && (
                              <ExerciseAccordion exercises={tracking.exercises} />
                            )}
                            {typeof tracking.intensity === "number" && (
                              <span><span className="font-medium">Intensity:</span> {tracking.intensity}/10</span>
                            )}
                          </div>

                          {/* Achievements */}
                          {progress && (
                            <div className="flex items-center gap-2 mt-1">
                              {progress.achievements && progress.achievements.length > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-semibold text-xs">
                                <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" /></svg>
                                {progress.achievements}
                              </span>
                              }
                              {progress.notes && (
                                <span className="text-gray-500 text-xs">({progress.notes})</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Notes section */}
                        {tracking.notes && (
                          <div className="mt-3 text-sm text-gray-500 flex items-center">
                            <NotesIcon notes={tracking.notes} />
                            <span className="ml-1 line-clamp-2">{tracking.notes}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}

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
                        .filter(item => {
                          const workoutDate = new Date(item.tracking.date)
                          return workoutDate.toDateString() === date.toDateString()
                        })
                        .map(item => (
                          <Card key={item.tracking.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{item.tracking.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(item.tracking.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} • {formatDuration(item.tracking.durationHours, item.tracking.durationMinutes)}
                                  </p>
                                </div>
                                <Badge
                                  className={`${item.tracking.activityType === "class"
                                    ? "bg-[#5856D6]/10 text-[#5856D6] border-0"
                                    : "bg-[#34C759]/10 text-[#34C759] border-0"
                                    } text-xs font-medium px-3 py-1 rounded-full`}
                                >
                                  {item.tracking.activityType}
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
