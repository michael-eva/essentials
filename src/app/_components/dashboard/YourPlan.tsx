"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Trash2, RotateCcw, Edit, Play, Pause, X, Plus } from "lucide-react"
import { api } from "@/trpc/react"
import { ConfirmationDialog } from "./ConfirmationDialog"
import WeeklySchedule from "./WeeklySchedule"
import useGeneratePlan from "@/hooks/useGeneratePlan"
import { motion } from "framer-motion"
import { ActivePlanSkeleton } from "./ClassRecommendationsSkeleton"
import { useRouter } from "next/navigation"
import DefaultBox from "../global/DefaultBox"



export default function ClassRecommendations() {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
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
    onConfirm: () => { console.log("confirm") },
    variant: "default"
  })

  // Fetch data using tRPC
  const utils = api.useUtils();
  const { data: activePlan, isLoading: isLoadingActivePlan } = api.workoutPlan.getActivePlan.useQuery()
  const { data: supplementaryWorkouts = [] } = api.workoutPlan.getSupplementaryWorkouts.useQuery()
  const startPlan = api.workoutPlan.startWorkoutPlan.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivePlan.invalidate();
    },
  });
  const pausePlan = api.workoutPlan.pauseWorkoutPlan.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivePlan.invalidate();
      void utils.workoutPlan.getUpcomingActivities.invalidate();
    },
  });
  const resumePlan = api.workoutPlan.resumeWorkoutPlan.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivePlan.invalidate();
      void utils.workoutPlan.getUpcomingActivities.invalidate();
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
  const { generatePlan, isLoading, LoadingScreen, GeneratePlanDialog } = useGeneratePlan();
  const planStatus: 'active' | 'paused' | 'not started' = activePlan?.isActive && !activePlan?.pausedAt && activePlan.startDate ? 'active' : activePlan?.pausedAt ? 'paused' : 'not started'

  const handleBookClass = (workoutId: string, name: string) => {
    let sessionType = ""
    if (name.toLowerCase().includes("reformer")) {
      sessionType = "Reformer"
    } else {
      sessionType = "Pilates"
    }
    // bookClass.mutate({ workoutId })
    router.push(`/dashboard/classes?sessionType=${sessionType}`)
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
          planId: activePlan?.id ?? "",
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

  const handleDeleteClass = (_weekNumber: number, _classIndex: number) => {
    // Implementation
  }

  const handleAddNewClass = (_weekNumber: number) => {
    // Implementation
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

  const handleGeneratePlan = () => {
    generatePlan();
  };

  return (
    <DefaultBox title="Your Personalised Plan" description="Combined classes and supplementary workouts" showViewAll={false}>
      {GeneratePlanDialog}
      <LoadingScreen />
      {isLoadingActivePlan ? (
        <ActivePlanSkeleton />
      ) : !activePlan ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-lg border-brand-brown border"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Active Plan</h2>
          <p className="text-gray-500 mb-6 text-center">
            You don&apos;t have an active workout plan yet. Create a new plan to get started on your fitness journey!
          </p>
          <Button
            variant="outline"
            onClick={handleGeneratePlan}
            className="border-none bg-brand-bright-orange text-brand-white hover:bg-brand-bright-orange/90 transition-colors"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isLoading ? "Generating Plan..." : "Create New Plan"}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white">
            <div className="px-2 pt-6 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${planStatus === 'active'
                    ? 'bg-[#34C759]/10 text-[#34C759]'
                    : planStatus === 'paused'
                      ? 'bg-[#FF9500]/10 text-[#FF9500]'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                    {planStatus === 'active' ? 'Active' : planStatus === 'paused' ? 'Paused' : 'Inactive'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{activePlan?.planName || 'Inactive'}</span>
                    {activePlan?.planName && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handlePlanNameEdit}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-0">
              <WeeklySchedule
                weeks={getWeeklySchedules()}
                // isEditing={planStatus === 'not started'}
                isEditing={true}
                onDeleteClass={handleDeleteClass}
                onAddClass={handleAddNewClass}
                onBookClass={handleBookClass}
                editingWeeks={editingWeeks}
                onToggleWeekEdit={toggleWeekEdit}
                isActivePlan={true}
                planData={activePlan ? {
                  startDate: activePlan.startDate,
                  pausedAt: activePlan.pausedAt,
                  resumedAt: activePlan.resumedAt,
                  totalPausedDuration: activePlan.totalPausedDuration
                } : undefined}
              />
            </div>
          </div>
        </motion.div>
      )}

      {activePlan && planStatus === 'not started' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex w-full gap-3 pt-2 justify-between"
        >
          <Button
            variant="outline"
            onClick={handleGeneratePlan}
            className="border-brand-brown text-accent hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Plan
          </Button>
          <Button
            onClick={handleStartPlan}
            className="bg-brand-bright-orange text-brand-white hover:bg-brand-bright-orange/90 transition-colors"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Plan
          </Button>
        </motion.div>
      )}

      {(planStatus === 'active' || planStatus === 'paused') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex w-full gap-3 pt-2 justify-between"
        >
          {planStatus === 'active' ? (
            <Button
              variant="outline"
              onClick={handlePausePlan}
              className="text-brand-white border-none bg-brand-bright-orange transition-colors"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleStartPlan}
              className="border-none text-brand-white bg-brand-bright-orange hover:bg-gray-50 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRestartPlan}
              className="border-brand-brown text-brand-black hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelPlan}
              className="bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* View Previous Plans Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex justify-center pt-6"
      >
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/previous-plans')}
          className="border-brand-brown text-brand-black hover:bg-gray-50 transition-colors"
        >
          View Previous Plans
        </Button>
      </motion.div>

      {/* Dialogs */}


      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) => setConfirmationDialog({ ...confirmationDialog, open })}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        onConfirm={confirmationDialog.onConfirm}
        variant={confirmationDialog.variant}
      />

      <Dialog open={editPlanNameDialogOpen} onOpenChange={setEditPlanNameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Edit Plan Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="planName" className="text-sm font-medium text-gray-700">
                Plan Name
              </label>
              <Input
                id="planName"
                value={editedPlanName}
                onChange={(e) => setEditedPlanName(e.target.value)}
                placeholder="Enter plan name"
                className="border-gray-200 focus:border-[#007AFF] focus:ring-[#007AFF]"
              />
            </div>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setEditPlanNameDialogOpen(false)}
                className="w-1/2"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePlanNameSave}
                variant="default"
                className="w-1/2"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addClassDialogOpen} onOpenChange={setAddClassDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Add New Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* TODO: Add class selection UI here */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setAddClassDialogOpen(false)}
                className="border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implement add class mutation
                  setAddClassDialogOpen(false)
                }}
                className="bg-[#007AFF] text-white hover:bg-[#007AFF]/90 transition-colors"
              >
                Add Class
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DefaultBox>
  )
}

