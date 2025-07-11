"use client"
import { Button } from "@/components/ui/button"
import { Trash2, RotateCcw, ArrowLeft } from "lucide-react"
import { api } from "@/trpc/react"
import { ConfirmationDialog } from "./ConfirmationDialog"
import WeeklySchedule from "./WeeklySchedule"
import { motion } from "framer-motion"
import { PreviousPlansSkeleton } from "./ClassRecommendationsSkeleton"
import { useState } from "react"
import DefaultBox from "../global/DefaultBox"

export default function PreviousPlans() {
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
  const { data: previousPlans = [], isLoading: isLoadingPreviousPlans } = api.workoutPlan.getPreviousPlans.useQuery()
  const { data: activePlan } = api.workoutPlan.getActivePlan.useQuery()
  const { data: supplementaryWorkouts = [] } = api.workoutPlan.getSupplementaryWorkouts.useQuery()
  console.log(previousPlans);

  const cancelPlan = api.workoutPlan.cancelWorkoutPlan.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivePlan.invalidate();
      void utils.workoutPlan.getPreviousPlans.invalidate();
    },
  });
  const restartPlan = api.workoutPlan.restartWorkoutPlan.useMutation({
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
    console.log("Deleting plan:", planToDelete.id);
    setConfirmationDialog({
      open: true,
      title: "Delete Plan",
      description: "Are you sure you want to delete this plan? This action cannot be undone.",
      onConfirm: () => {
        deletePlan.mutate({ planId: planToDelete.id });
        setConfirmationDialog({ ...confirmationDialog, open: false });
      },
      variant: "destructive"
    });
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

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-brand-brown hover:text-brand-brown/80 mb-2"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </Button>
      <DefaultBox title="Previous Plans" description="View and manage your archived workout plans" showViewAll={false}>
        {isLoadingPreviousPlans ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PreviousPlansSkeleton />
          </motion.div>
        ) : previousPlans.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              {[...previousPlans]
                .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
                .map((plan, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                  >
                    <div className="bg-white/80 border border-gray-100 rounded-xl shadow-sm">
                      <div className="px-2 pt-6 pb-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                              Archived
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{plan.planName}</span>
                              <span className="text-sm text-gray-500">• {plan.weeks} Week Plan</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">{new Date(plan.savedAt).toLocaleDateString()}</span>
                            <div className="flex gap-2 ml-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReinstatePlan(idx)}
                                className="h-8 border-gray-200 text-[#007AFF] hover:bg-gray-50 transition-colors"
                                aria-label="Reinstate plan"
                              >
                                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                <span className="hidden sm:inline">Reinstate</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePreviousPlan(idx)}
                                className="h-8 border-gray-200 text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors"
                                aria-label="Delete plan"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                <span className="hidden sm:inline">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-0">
                        <WeeklySchedule
                          weeks={getWeeklySchedulesForPlan(parseInt(plan.weeks.toString()), idx)}
                          accordionValuePrefix={`prev-${idx}-`}
                          isActivePlan={false}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-lg border-brand-brown border"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Previous Plans</h2>
            <p className="text-gray-500 mb-6 text-center">
              You don&apos;t have any archived workout plans yet. Completed or cancelled plans will appear here.
            </p>
          </motion.div>
        )}

        <ConfirmationDialog
          open={confirmationDialog.open}
          onOpenChange={(open) => setConfirmationDialog({ ...confirmationDialog, open })}
          title={confirmationDialog.title}
          description={confirmationDialog.description}
          onConfirm={confirmationDialog.onConfirm}
          variant={confirmationDialog.variant}
        />
      </DefaultBox>
    </>
  )
}
