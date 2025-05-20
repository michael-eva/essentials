"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Trash2, RotateCcw, Edit, Play, Pause, X, Plus } from "lucide-react"
import { api } from "@/trpc/react"
import { ConfirmationDialog } from "./ConfirmationDialog"
import WeeklySchedule from "./WeeklySchedule"



export default function ClassRecommendations() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reinstateDialogOpen, setReinstateDialogOpen] = useState(false)
  const [editPlanNameDialogOpen, setEditPlanNameDialogOpen] = useState(false)
  const [editedPlanName, setEditedPlanName] = useState("")
  const [editingWeeks, setEditingWeeks] = useState<Set<number>>(new Set())
  const [addClassDialogOpen, setAddClassDialogOpen] = useState(false)
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
  const [planToDeleteId, setPlanToDeleteId] = useState<string | null>(null)
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
  const updatePlanName = api.workoutPlan.updatePlanName.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivePlan.invalidate();
    },
  });
  const deletePlan = api.workoutPlan.deleteWorkoutPlan.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivePlan.invalidate();
      void utils.workoutPlan.getPreviousPlans.invalidate();
    },
  });
  const planStatus: 'active' | 'paused' | 'not started' = activePlan?.isActive && !activePlan?.pausedAt && activePlan.startDate ? 'active' : activePlan?.pausedAt ? 'paused' : 'not started'

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
        classesPerWeek: week.items.filter(item => item && item.type === 'class').length,
        workoutsPerWeek: week.items.filter(item => item && item.type === 'workout').length,
      }));
    }
    // Fallback (if no activePlan or no weeklySchedules)
    return [];
  }

  // Helper to get weekly breakdown for a given plan
  const getWeeklySchedulesForPlan = (weeks: number, planIndex: number) => {
    const plan = previousPlans[planIndex];
    if (!plan) return [];

    return Array.from({ length: weeks }, (_, i) => {
      const weekItems = [
        ...(plan.weeklySchedules?.[i]?.items ?? []),
        ...supplementaryWorkouts
      ];
      return {
        weekNumber: i + 1,
        items: weekItems,
        classesPerWeek: weekItems.filter(item => item && item.type === 'class').length,
        workoutsPerWeek: weekItems.filter(item => item && item.type === 'workout').length
      }
    })
  }


  const handleDeletePreviousPlan = (idx: number) => {
    const planToDelete = previousPlans[idx];
    if (!planToDelete?.id) return;

    setPlanToDeleteId(planToDelete.id);
    setConfirmationDialog({
      open: true,
      title: "Delete Plan",
      description: "Are you sure you want to delete this plan? This action cannot be undone.",
      onConfirm: confirmDeletePlan,
      variant: "destructive"
    });
  }

  const confirmDeletePlan = () => {
    if (planToDeleteId) {
      deletePlan.mutate({ planId: planToDeleteId });
      setConfirmationDialog({ ...confirmationDialog, open: false });
      setPlanToDeleteId(null);
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
    const planToReinstate = previousPlans[idx];
    if (!planToReinstate?.id) return;

    setConfirmationDialog({
      open: true,
      title: "Reinstate Plan",
      description: "Are you sure you want to reinstate this plan? Your current active plan will be archived.",
      onConfirm: () => {
        if (activePlan?.id) {
          // First deactivate current plan
          cancelPlan.mutate(
            { planId: activePlan.id },
            {
              onSuccess: () => {
                // Then activate the selected plan
                restartPlan.mutate(
                  { planId: planToReinstate.id },
                  {
                    onSuccess: () => {
                      setConfirmationDialog({ ...confirmationDialog, open: false });
                      void utils.workoutPlan.getPreviousPlans.invalidate();
                    },
                  }
                );
              },
            }
          );
        } else {
          // If no active plan, just activate the selected plan
          restartPlan.mutate(
            { planId: planToReinstate.id },
            {
              onSuccess: () => {
                setConfirmationDialog({ ...confirmationDialog, open: false });
                void utils.workoutPlan.getPreviousPlans.invalidate();
              },
            }
          );
        }
      },
      variant: "default"
    });
  }

  const handlePlanNameEdit = () => {
    if (activePlan?.planName) {
      setEditedPlanName(activePlan.planName)
      setEditPlanNameDialogOpen(true)
    }
  }

  const handlePlanNameSave = () => {
    if (activePlan?.id) {
      updatePlanName.mutate({
        planId: activePlan.id,
        newName: editedPlanName
      })
    }
    setEditPlanNameDialogOpen(false)
  }

  const handleDeleteClass = (weekNumber: number, classIndex: number) => {
    setConfirmationDialog({
      open: true,
      title: "Delete Class",
      description: "Are you sure you want to remove this class from your plan?",
      onConfirm: () => {
        // TODO: Implement delete class mutation
        setConfirmationDialog({ ...confirmationDialog, open: false })
      },
      variant: "destructive"
    })
  }

  const handleAddNewClass = (weekNumber: number) => {
    setAddClassDialogOpen(true)
  }

  const toggleWeekEdit = (weekNumber: number) => {
    setEditingWeeks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(weekNumber)) {
        newSet.delete(weekNumber)
      } else {
        newSet.add(weekNumber)
      }
      return newSet
    })
  }

  return (
    <div>
      {!activePlan && (
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl md:text-2xl font-bold mb-2">No Active Plan</h2>
          <p className="text-muted-foreground mb-4 text-center">
            You don't have an active workout plan yet. Create a new plan to get started on your fitness journey!
          </p>
          <Button variant="outline" onClick={() => { /* handle create new plan */ }}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Plan
          </Button>
        </div>
      )}

      {activePlan && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-bold">Your Personalized Plan</h2>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded text-sm font-semibold ${planStatus === 'active' ? 'bg-green-100 text-green-800' : planStatus === 'paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
              {planStatus === 'active' ? 'Active Plan' : planStatus === 'paused' ? 'Paused Plan' : 'Not Started'}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-base">{activePlan?.planName || 'Not Started'}</span>
              {activePlan?.planName && (
                <Button size="sm" variant="ghost" onClick={handlePlanNameEdit}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {activePlan && <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">Your Weekly Plan</CardTitle>
          </div>
          <CardDescription>Combined classes and supplementary workouts</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <WeeklySchedule
            weeks={getWeeklySchedules()}
            isEditing={planStatus === 'not started'}
            onDeleteClass={handleDeleteClass}
            onAddClass={handleAddNewClass}
            onBookClass={handleBookClass}
            editingWeeks={editingWeeks}
            onToggleWeekEdit={toggleWeekEdit}
          />
        </CardContent>
      </Card>}

      {activePlan && planStatus === 'not started' && (
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

      {(planStatus === 'active' || planStatus === 'paused') && (
        <div className="flex w-full gap-2 pt-2 justify-between">
          {planStatus === 'active' ? (
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
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReinstatePlan(idx)}
                          className="h-8"
                          aria-label="Reinstate plan"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                          <span className="hidden sm:inline">Reinstate</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePreviousPlan(idx)}
                          className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          aria-label="Delete plan"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <WeeklySchedule
                      weeks={getWeeklySchedulesForPlan(parseInt(plan.weeks.toString()), idx)}
                      accordionValuePrefix={`prev-${idx}-`}
                    />
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

      {/* Reusable Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) => setConfirmationDialog({ ...confirmationDialog, open })}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        onConfirm={confirmationDialog.onConfirm}
        variant={confirmationDialog.variant}
      />

      {/* Edit Plan Name Dialog */}
      <Dialog open={editPlanNameDialogOpen} onOpenChange={setEditPlanNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Plan Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="planName" className="text-sm font-medium">
                Plan Name
              </label>
              <Input
                id="planName"
                value={editedPlanName}
                onChange={(e) => setEditedPlanName(e.target.value)}
                placeholder="Enter plan name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditPlanNameDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePlanNameSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Class Dialog */}
      <Dialog open={addClassDialogOpen} onOpenChange={setAddClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* TODO: Add class selection UI here */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddClassDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // TODO: Implement add class mutation
                setAddClassDialogOpen(false)
              }}>
                Add Class
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

