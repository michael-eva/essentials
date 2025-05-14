"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Trash2, RotateCcw, Edit } from "lucide-react"
import { type WorkoutPlan, type Workout } from "@/data/workouts"
import { api } from "@/trpc/react"
import Link from "next/link"

export default function ClassRecommendations() {
  const [timeCommitment, setTimeCommitment] = useState("2")
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [planName, setPlanName] = useState("")
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [completedWorkouts, setCompletedWorkouts] = useState<Record<string, boolean>>({})
  const [isActivePlan, setIsActivePlan] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reinstateDialogOpen, setReinstateDialogOpen] = useState(false)
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(null)

  // Fetch data using tRPC
  const { data: previousPlans = [] } = api.workoutPlan.getPreviousPlans.useQuery()
  const { data: activePlan } = api.workoutPlan.getActivePlan.useQuery()
  const { data: supplementaryWorkouts = [] } = api.workoutPlan.getSupplementaryWorkouts.useQuery()

  // Mutations

  const handleClassSelection = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    )
  }

  const handleBookClass = (classItem: Workout) => {
    // bookClassMutation.mutate({
    //   name: classItem.name,
    //   instructor: classItem.instructor || "TBD",
    //   duration: classItem.duration,
    //   level: classItem.level,
    //   type: classItem.type
    // })
  }

  const getWeeklySchedules = () => {
    const weeks = parseInt(timeCommitment)
    return Array.from({ length: weeks }, (_, i) => {
      const weekItems = [...(activePlan?.weeklySchedules?.[i]?.items ?? []), ...supplementaryWorkouts].filter(item => item.weekNumber === i + 1)
      return {
        weekNumber: i + 1,
        items: weekItems,
        sessionsPerWeek: weekItems.filter(item => item.type === 'class').length
      }
    })
  }

  // Helper to get weekly breakdown for a given plan
  const getWeeklySchedulesForPlan = (plan: WorkoutPlan) => {
    const weeks = parseInt(plan.timeCommitment)
    return Array.from({ length: weeks }, (_, i) => {
      const weekItems = [...(activePlan?.weeklySchedules?.[i]?.items ?? []), ...supplementaryWorkouts].filter(item => item.weekNumber === i + 1)
      return {
        weekNumber: i + 1,
        items: weekItems,
        sessionsPerWeek: weekItems.filter(item => item.type === 'class').length
      }
    })
  }

  const handleSavePlan = () => {
    if (isActivePlan) {
      const newPlan: WorkoutPlan = {
        planName,
        timeCommitment,
        selectedClasses,
        completedWorkouts,
        savedAt: new Date().toISOString(),
        weeklySchedules: getWeeklySchedulesForPlan({ timeCommitment, selectedClasses, completedWorkouts } as WorkoutPlan),
        archived: false,
        isActive: true
      }
      console.log("Saving plan:", newPlan)
    }
    setIsActivePlan(true)
    setIsSaveDialogOpen(false)
  }

  const handleDeletePreviousPlan = (idx: number) => {
    setSelectedPlanIndex(idx)
    setDeleteDialogOpen(true)
  }

  const confirmDeletePlan = () => {
    if (selectedPlanIndex !== null) {
      // In a real app, this would be a tRPC mutation
      console.log("Deleting plan at index:", selectedPlanIndex)
      setDeleteDialogOpen(false)
      setSelectedPlanIndex(null)
    }
  }

  const handleStartNewPlan = () => {
    if (isActivePlan) {
      const newPlan: WorkoutPlan = {
        planName,
        timeCommitment,
        selectedClasses,
        completedWorkouts,
        savedAt: new Date().toISOString(),
        weeklySchedules: getWeeklySchedulesForPlan({ timeCommitment, selectedClasses, completedWorkouts } as WorkoutPlan),
        archived: false,
        isActive: true
      }
      console.log("Archiving plan:", newPlan)
    }
    setPlanName("")
    setTimeCommitment("2")
    setSelectedClasses([])
    setCompletedWorkouts({})
    setIsActivePlan(false)
  }

  const handleReinstatePlan = (idx: number) => {
    setSelectedPlanIndex(idx)
    setReinstateDialogOpen(true)
  }

  const confirmReinstatePlan = () => {
    if (selectedPlanIndex !== null) {
      const planToReinstate = previousPlans[selectedPlanIndex]
      if (!planToReinstate) return

      if (isActivePlan) {
        const newPlan: WorkoutPlan = {
          planName,
          timeCommitment,
          selectedClasses,
          completedWorkouts,
          savedAt: new Date().toISOString(),
          weeklySchedules: getWeeklySchedulesForPlan({ timeCommitment, selectedClasses, completedWorkouts } as WorkoutPlan),
          archived: false,
          isActive: true
        }
        console.log("Archiving current plan:", newPlan)
      }

      // Set state to reinstated plan
      setPlanName(planToReinstate.planName)
      setTimeCommitment(planToReinstate.timeCommitment)
      setSelectedClasses(planToReinstate.selectedClasses)
      setCompletedWorkouts(planToReinstate.completedWorkouts)
      setIsActivePlan(true)
      setReinstateDialogOpen(false)
      setSelectedPlanIndex(null)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Your Personalized Plan</h2>
        {isActivePlan && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">Active Plan</span>
            <span className="font-medium text-base">{planName}</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">Your Weekly Plan</CardTitle>
            <Link href="#" className="text-sm text-muted-foreground flex items-center gap-2"><Edit className="w-4 h-4" />Edit</Link>
          </div>
          <CardDescription>Combined classes and supplementary workouts</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion type="multiple" className="w-full">
            {getWeeklySchedules().map((week) => (
              <AccordionItem key={week.weekNumber} value={`week-${week.weekNumber}`}>
                <AccordionTrigger className="font-bold text-base px-4 py-3 bg-muted/30">
                  Week {week.weekNumber} <span className="ml-2 font-normal text-sm text-muted-foreground">{week.sessionsPerWeek} classes per week</span>
                </AccordionTrigger>
                <AccordionContent className="px-2 md:px-4 pb-4">
                  <div className="space-y-3">
                    {week.items.map((item, index) => (
                      <div
                        key={index}
                        className={`py-3 px-3 flex justify-between items-start border-l-4 rounded border-b ${item.type === 'class'
                          ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/5'
                          : 'border-[color:var(--chart-4)] bg-[color:var(--chart-4)]/5'
                          }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {item.type === 'class' ? (
                              <span className="inline-flex items-center text-xs text-blue-700">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                                Class
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs text-green-700">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg>
                                Workout
                              </span>
                            )}
                            <span className="font-semibold text-base">{item.name}</span>
                          </div>
                          <div className="flex gap-1 mb-1">
                            <span className="text-xs rounded bg-secondary/10 text-secondary px-2 py-0.5">
                              {item.level}
                            </span>
                            <span className="text-xs rounded bg-secondary/10 text-secondary px-2 py-0.5">
                              {item.duration} min
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {item.description}
                          </div>
                        </div>
                        {item.type === 'class' && (
                          <div className="flex gap-2">
                            <Button
                              variant={selectedClasses.includes(item.name) ? "secondary" : "outline"}
                              size="sm"
                              onClick={() => handleClassSelection(item.name)}
                              className="text-xs px-3 py-1 h-7"
                            >
                              {selectedClasses.includes(item.name) ? "Selected" : "Select"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBookClass(item)}
                              className="text-xs px-3 py-1 h-7"
                            >
                              Book
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {!isActivePlan && (
        <div className="flex justify-end pt-4">
          <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto px-8">Save Plan</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Your Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="planName" className="text-sm font-medium">
                    Plan Name
                  </label>
                  <Input
                    id="planName"
                    placeholder="Enter a name for your plan"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleSavePlan}
                  disabled={!planName.trim()}
                >
                  Save Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {isActivePlan && (
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={handleStartNewPlan}>
            Start New Plan
          </Button>
        </div>
      )}

      {previousPlans.length > 0 && (
        <div className="pt-8">
          <h3 className="text-lg font-semibold mb-4">Previous Plans</h3>
          <div className="space-y-4">
            {[...previousPlans]
              .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
              .map((plan, idx) => (
                <Card key={idx} className="border border-muted-foreground/10">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{plan.planName}</CardTitle>
                      <CardDescription>{plan.timeCommitment} Week Plan</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{new Date(plan.savedAt).toLocaleDateString()}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleReinstatePlan(idx)} aria-label="Reinstate plan">
                        <RotateCcw className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePreviousPlan(idx)} aria-label="Delete plan">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Accordion for weekly details */}
                    <Accordion type="multiple" className="w-full">
                      {plan.weeklySchedules?.map((week: { items: Workout[]; weekNumber?: number }) => (
                        <AccordionItem key={week.weekNumber} value={`week-${week.weekNumber}-prev-${idx}`}>
                          <AccordionTrigger className="font-bold text-base px-4 py-3 bg-muted/30">
                            Week {week.weekNumber} <span className="ml-2 font-normal text-sm text-muted-foreground">{week.items.filter(item => item.type === 'class').length} classes per week</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-2 md:px-4 pb-4">
                            <div className="space-y-3">
                              {week.items.map((item: Workout, index: number) => (
                                <div
                                  key={index}
                                  className={`py-3 px-3 flex justify-between items-start border-l-4 rounded border-b ${item.type === 'class'
                                    ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/5'
                                    : 'border-[color:var(--chart-4)] bg-[color:var(--chart-4)]/5'
                                    }`}
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      {item.type === 'class' ? (
                                        <span className="inline-flex items-center text-xs text-blue-700">
                                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                                          Class
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center text-xs text-green-700">
                                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg>
                                          Workout
                                        </span>
                                      )}
                                      <span className="font-semibold text-base">{item.name}</span>
                                    </div>
                                    <div className="flex gap-1 mb-1">
                                      <span className="text-xs rounded bg-secondary/10 text-secondary px-2 py-0.5">
                                        {item.level}
                                      </span>
                                      <span className="text-xs rounded bg-secondary/10 text-secondary px-2 py-0.5">
                                        {item.duration} min
                                      </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                      {item.description}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Are you sure you want to delete this plan? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeletePlan}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reinstate Confirmation Dialog */}
      <Dialog open={reinstateDialogOpen} onOpenChange={setReinstateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reinstate Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Are you sure you want to reinstate this plan? Your current active plan will be archived.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReinstateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmReinstatePlan}>
                Reinstate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

