"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Activity, BarChart3, CalendarDays, Clock, Bike, Footprints, Mountain, Waves } from "lucide-react"
import { api } from "@/trpc/react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

// Map activity types to icons
const activityTypeIcons: Record<string, React.ReactNode> = {
  Running: <Activity className="h-5 w-5 text-primary" />,
  Cycling: <Bike className="h-5 w-5 text-primary" />,
  Swimming: <Waves className="h-5 w-5 text-primary" />,
  Walking: <Footprints className="h-5 w-5 text-primary" />,
  Hiking: <Mountain className="h-5 w-5 text-primary" />,
  Rowing: <Activity className="h-5 w-5 text-primary" />,
  Elliptical: <Activity className="h-5 w-5 text-primary" />,
}

export default function WorkoutHistory() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [page, setPage] = useState(1)
  const [allActivities, setAllActivities] = useState<typeof activityHistory>([])
  const ITEMS_PER_PAGE = 10

  const { data: activityHistory = [], isLoading } = api.workoutPlan.getActivityHistory.useQuery({
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE
  })

  const { data: totalCount = 0 } = api.workoutPlan.getActivityHistoryCount.useQuery()

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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Workout History</CardTitle>
          <CardDescription>View and filter your past activities</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="list" className="w-full">
            {/* <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="list" className="flex items-center justify-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">List View</span>
                <span className="sm:hidden">List</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center justify-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Calendar</span>
                <span className="sm:hidden">Cal</span>
              </TabsTrigger>
            </TabsList> */}

            <TabsContent value="list" className="space-y-3">
              {allActivities.map((workout) => (
                <Card key={workout.id} className="overflow-hidden">
                  <div className="p-3 sm:p-4">
                    {/* Top row: Icon, Title, Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          {activityTypeIcons[workout.name!] ?? <Activity className="h-5 w-5 text-primary" />}
                        </div>
                        <span className="font-semibold text-base">{workout.name}</span>
                      </div>
                      <Badge variant="outline" className={`bg-green-100 text-green-800 border-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${workout.activityType === "class" ? "bg-blue-100 text-blue-800" : ""}`}>
                        {workout.activityType}
                      </Badge>
                    </div>

                    {/* Meta info row */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDuration(workout.durationHours, workout.durationMinutes)}
                      </div>
                      {workout.distance && (
                        <div className="flex items-center gap-1">
                          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                          {workout.distance} {workout.distanceUnit}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {formatDate(workout.date)}
                      </div>
                    </div>

                    {/* Notes section */}
                    {workout.notes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p className="line-clamp-2">{workout.notes}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "See More"}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar">
              <div className="flex flex-col items-center">
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border w-full max-w-[350px]" />

                <div className="w-full mt-4">
                  <h3 className="font-medium mb-2 px-1">
                    {date
                      ? date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "Select a date"}
                  </h3>

                  {date && (
                    <div className="space-y-2">
                      {allActivities
                        .filter(workout => {
                          const workoutDate = new Date(workout.date)
                          return workoutDate.toDateString() === date.toDateString()
                        })
                        .map(workout => (
                          <Card key={workout.id}>
                            <CardContent className="p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{workout.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(workout.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} • {formatDuration(workout.durationHours, workout.durationMinutes)}
                                  </p>
                                </div>
                                <Badge className="shrink-0">{workout.activityType}</Badge>
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
        </CardContent>
      </Card>
    </div>
  )
}
