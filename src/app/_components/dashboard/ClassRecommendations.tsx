"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Trash2, RotateCcw, Edit, Play, Pause, X, Plus } from "lucide-react"
import { api } from "@/trpc/react"
import Link from "next/link"
import type { NewWorkoutPlan, Workout } from "@/drizzle/src/db/queries"
import { ConfirmationDialog } from "./ConfirmationDialog"

export default function ClassRecommendations() {
  const [timeCommitment, setTimeCommitment] = useState("2")
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [planName, setPlanName] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reinstateDialogOpen, setReinstateDialogOpen] = useState(false)
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(null)
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => { },
    variant: "default"
  })

  // Fetch data using tRPC
  const utils = api.useUtils();
  const { data: previousPlans = [] } = api.workoutPlan.getPreviousPlans.useQuery()
  const { data: activePlan } = api.workoutPlan.getActivePlan.useQuery()
  const { data: supplementaryWorkouts = [] } = api.workoutPlan.getSupplementaryWorkouts.useQuery()
  const startPlan = api.workoutPlan.startWorkoutPlan.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivePlan.invalidate();
    },
  });
  const pausePlan = api.workoutPlan.pauseWorkoutPlan.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivePlan.invalidate();
    },
  });
  const resumePlan = api.workoutPlan.resumeWorkoutPlan.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivePlan.invalidate();
    },
  });
  const restartPlan = api.workoutPlan.restartWorkoutPlan.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivePlan.invalidate();
    },
  });
  const cancelPlan = api.workoutPlan.cancelWorkoutPlan.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivePlan.invalidate();
      void utils.workoutPlan.getPreviousPlans.invalidate();
    },
  });
  const showActivePlan = activePlan?.isActive && !activePlan?.pausedAt && activePlan.startDate

  const handleBookClass = () => {
    // bookClassMutation.mutate({
    //   name: classItem.name,
    //   instructor: classItem.instructor || "TBD",
    //   duration: classItem.duration,
    //   level: classItem.level,
    //   type: classItem.type
    // })
  }

  const getWeeklySchedules = () => {
    if (activePlan?.weeklySchedules) {
      // Use the weeklySchedules directly from the activePlan
      return activePlan.weeklySchedules.map((week) => ({
        weekNumber: week.weekNumber,
        items: week.items,
        sessionsPerWeek: week.items.filter(item => item && item.type === 'class').length,
      }));
    }
    // Fallback (if no activePlan or no weeklySchedules)
    return [];
  }

  // Helper to get weekly breakdown for a given plan
  const getWeeklySchedulesForPlan = (weeks: number) => {
    return Array.from({ length: weeks }, (_, i) => {
      const weekItems = [
        ...(activePlan?.weeklySchedules?.[i]?.items ?? []),
        ...supplementaryWorkouts
      ];
      return {
        weekNumber: i + 1,
        items: weekItems,
        sessionsPerWeek: weekItems.filter(item => item && item.type === 'class').length
      }
    })
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

  const handleStartPlan = () => {
    setConfirmationDialog({
      open: true,
      title: activePlan?.pausedAt ? "Resume Plan" : "Start Plan",
      description: activePlan?.pausedAt
        ? "Are you sure you want to resume this plan?"
        : "Are you sure you want to start this plan? This will become your active workout plan.",
      onConfirm: () => {
        if (activePlan?.pausedAt) {
          // Resume the plan
          if (activePlan?.id) {
            resumePlan.mutate(
              { planId: activePlan.id },
              {
                onSuccess: () => {
                  setConfirmationDialog({ ...confirmationDialog, open: false });
                },
                onError: (error) => {
                  console.error("Failed to resume plan:", error);
                }
              }
            );
          }
        } else {
          // Start a new plan
          if (activePlan?.id) {
            startPlan.mutate(
              { planId: activePlan.id },
              {
                onSuccess: () => {
                  setConfirmationDialog({ ...confirmationDialog, open: false });
                },
                onError: (error) => {
                  console.error("Failed to start plan:", error);
                }
              }
            );
          }
        }
      }
    });
  };

  const handlePausePlan = () => {
    setConfirmationDialog({
      open: true,
      title: "Pause Plan",
      description: "Are you sure you want to pause this plan? You can resume it later.",
      onConfirm: () => {
        setConfirmationDialog({ ...confirmationDialog, open: false })
        pausePlan.mutate({
          planId: activePlan?.id || "",
        })
      }
    })
  }

  const handleRestartPlan = () => {
    setConfirmationDialog({
      open: true,
      title: "Reset Plan",
      description: "Are you sure you want to reset this plan? This will reset all progress and start from the beginning.",
      onConfirm: () => {
        if (activePlan?.id) {
          restartPlan.mutate(
            { planId: activePlan.id },
            {
              onSuccess: () => {
                setConfirmationDialog({ ...confirmationDialog, open: false });
              },
            }
          );
        }
      },
    });
  };

  const handleCancelPlan = () => {
    setConfirmationDialog({
      open: true,
      title: "Cancel Plan",
      description: "Are you sure you want to cancel this plan? This action cannot be undone.",
      onConfirm: () => {
        setPlanName("")
        setSelectedClasses([])
        setConfirmationDialog({ ...confirmationDialog, open: false })
        if (activePlan?.id) {
          cancelPlan.mutate({
            planId: activePlan.id,
          })
        }
      },
      variant: "destructive"
    })
  }

  const handleReinstatePlan = (idx: number) => {
    setSelectedPlanIndex(idx)
    setReinstateDialogOpen(true)
  }

  const confirmReinstatePlan = () => {
    if (selectedPlanIndex !== null) {
      const planToReinstate = previousPlans[selectedPlanIndex]
      if (!planToReinstate) return

      // Set state to reinstated plan
      setPlanName(planToReinstate.planName)
      setTimeCommitment(planToReinstate.weeks.toString())
      setReinstateDialogOpen(false)
      setSelectedPlanIndex(null)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Your Personalized Plan</h2>
        {showActivePlan && (
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded text-sm font-semibold ${activePlan.pausedAt ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {activePlan.pausedAt ? 'Paused Plan' : 'Active Plan'}
            </span>
            <span className="font-medium text-base">{activePlan.planName}</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">Your Weekly Plan</CardTitle>
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
                  <Link href="#" className="text-sm text-muted-foreground flex items-center gap-2"><Edit className="w-4 h-4" />Edit week {week.weekNumber}</Link>
                  <div className="space-y-3">
                    {week.items.filter(Boolean).map((item, index) => {
                      const workout = item as Workout;
                      return (
                        <div
                          key={index}
                          className={`py-3 px-3 flex justify-between items-start border-l-4 rounded border-b ${workout.type === 'class'
                            ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/5'
                            : 'border-[color:var(--chart-4)] bg-[color:var(--chart-4)]/5'
                            }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {workout.type === 'class' ? (
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
                              <span className="font-semibold text-base">{workout.name}</span>
                            </div>
                            <div className="flex gap-1 mb-1">
                              <span className="text-xs rounded bg-secondary/10 text-secondary px-2 py-0.5">
                                {workout.level}
                              </span>
                              <span className="text-xs rounded bg-secondary/10 text-secondary px-2 py-0.5">
                                {workout.duration} min
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {workout.description}
                            </div>
                          </div>
                          {workout.type === 'class' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleBookClass()}
                                className={`text-xs px-3 py-1 h-7 ${workout.isBooked ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}
                              >
                                {workout.isBooked ? "Booked" : "Book"}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {!showActivePlan && (
        <div className="flex w-full gap-2 pt-2 justify-between">
          <Button
            variant="outline"
            onClick={() => { }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Plan
          </Button>
          <Button
            onClick={handleStartPlan}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Plan
          </Button>
        </div>
      )}

      {showActivePlan && (
        <div className="flex w-full gap-2 pt-2 justify-between">
          {!activePlan.pausedAt ? (
            <Button variant="outline" onClick={handlePausePlan}>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button variant="outline" onClick={handleStartPlan}>
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRestartPlan} className="bg-muted-foreground/40">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="destructive" onClick={handleCancelPlan}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
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
                      <CardDescription>{plan.weeks} Week Plan</CardDescription>
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
                      {getWeeklySchedulesForPlan(parseInt(plan.weeks.toString())).map((week) => (
                        <AccordionItem key={week.weekNumber} value={`week-${week.weekNumber}-prev-${idx}`}>
                          <AccordionTrigger className="font-bold text-base px-4 py-3 bg-muted/30">
                            Week {week.weekNumber} <span className="ml-2 font-normal text-sm text-muted-foreground">{week.items.filter(item => item?.type === 'class').length} classes per week</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-2 md:px-4 pb-4">
                            <div className="space-y-3">
                              {week.items.filter(Boolean).map((item, index) => {
                                const workout = item as Workout;
                                return (
                                  <div
                                    key={index}
                                    className={`py-3 px-3 flex justify-between items-start border-l-4 rounded border-b ${workout.type === 'class'
                                      ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/5'
                                      : 'border-[color:var(--chart-4)] bg-[color:var(--chart-4)]/5'
                                      }`}
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        {workout.type === 'class' ? (
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
                                        <span className="font-semibold text-base">{workout.name}</span>
                                      </div>
                                      <div className="flex gap-1 mb-1">
                                        <span className="text-xs rounded bg-secondary/10 text-secondary px-2 py-0.5">
                                          {workout.level}
                                        </span>
                                        <span className="text-xs rounded bg-secondary/10 text-secondary px-2 py-0.5">
                                          {workout.duration} min
                                        </span>
                                      </div>
                                      <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                        {workout.description}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
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
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Plan"
        description="Are you sure you want to delete this plan? This action cannot be undone."
        onConfirm={confirmDeletePlan}
        variant="destructive"
      />

      {/* Reinstate Confirmation Dialog */}
      <ConfirmationDialog
        open={reinstateDialogOpen}
        onOpenChange={setReinstateDialogOpen}
        title="Reinstate Plan"
        description="Are you sure you want to reinstate this plan? Your current active plan will be archived."
        onConfirm={confirmReinstatePlan}
      />

      {/* Reusable Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) => setConfirmationDialog({ ...confirmationDialog, open })}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        onConfirm={confirmationDialog.onConfirm}
        variant={confirmationDialog.variant}
      />
    </div>
  )
}

