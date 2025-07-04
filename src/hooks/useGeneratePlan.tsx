import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import MultiStepGeneratePlanDialog from "@/app/_components/dashboard/MultiStepGeneratePlanDialog";

interface PlanPreferences {
  workoutDuration: number;
  classDuration: number;
  workoutClassRatio: number;
  activitiesPerWeek: number;
  additionalNotes: string;
}

export default function useGeneratePlan({ redirectToPlan = true } = {}) {
  const router = useRouter();
  const utils = api.useUtils();
  const [showGeneratePlanDialog, setShowGeneratePlanDialog] = useState(false);

  const generatePlanMutation = api.workoutPlan.generatePlan.useMutation({
    onError: (error) => {
      toast.error("Failed to generate plan", {
        description: error.message,
      });
    },
    onSuccess: () => {
      void utils.workoutPlan.getActivePlan.invalidate();
      if (redirectToPlan) {
        router.push("/dashboard/your-plan");
      }
    },
  });

  const LoadingScreen = () => {
    if (!generatePlanMutation.isPending) return null;

    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-100 h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Sparkles className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Generating Your Plan</h2>
          <p className="text-gray-500">Please wait while we create your personalized workout plan...</p>
        </div>
      </div>
    );
  };

  const handleGeneratePlan = () => {
    setShowGeneratePlanDialog(true);
  };

  const handleConfirmGeneratePlan = (preferences: PlanPreferences) => {
    const { workoutDuration, classDuration, workoutClassRatio, activitiesPerWeek, additionalNotes } = preferences;

    // Build a comprehensive prompt based on user preferences
    let prompt = `For every workout of type 'workout', set the duration to ${workoutDuration} minutes. For every workout of type 'class', set the duration to ${classDuration} minutes.`;

    // Add activities per week preference
    prompt += ` The plan should have approximately ${activitiesPerWeek} activities per week.`;

    // Add distribution preference
    const workoutPercentage = workoutClassRatio;
    const classPercentage = 100 - workoutClassRatio;
    prompt += ` The plan should have approximately ${workoutPercentage}% workouts and ${classPercentage}% classes.`;

    // Add additional notes if provided
    if (additionalNotes.trim()) {
      prompt += ` Additional preferences: ${additionalNotes}`;
    }

    generatePlanMutation.mutate({ prompt });
    setShowGeneratePlanDialog(false);
  };

  return {
    generatePlan: handleGeneratePlan,
    isLoading: generatePlanMutation.isPending,
    error: generatePlanMutation.error,
    LoadingScreen,
    GeneratePlanDialog: (
      <MultiStepGeneratePlanDialog
        open={showGeneratePlanDialog}
        onOpenChange={setShowGeneratePlanDialog}
        onConfirm={handleConfirmGeneratePlan}
        isLoading={generatePlanMutation.isPending}
      />
    ),
  };
}