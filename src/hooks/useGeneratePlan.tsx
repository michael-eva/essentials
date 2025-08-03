import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import MultiStepGeneratePlanDialog from "@/app/_components/dashboard/MultiStepGeneratePlanDialog";
import type { PlanPreferences } from "@/app/_components/dashboard/GeneratePlanDialog";


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
      void utils.workoutPlan.getUpcomingActivities.invalidate();
      void utils.workoutPlan.getPreviousPlans.invalidate();
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
          <p className="text-gray-500">Please wait while we create your personalised workout plan...</p>
        </div>
      </div>
    );
  };

  const handleGeneratePlan = () => {
    setShowGeneratePlanDialog(true);
  };

  const handleConfirmGeneratePlan = (preferences: PlanPreferences) => {
    const { additionalNotes, shortClassesPerWeek, mediumClassesPerWeek, longClassesPerWeek, additionalCardioWorkouts, isCardioWorkout, cardioType, shortWorkoutsPerWeek, mediumWorkoutsPerWeek, longWorkoutsPerWeek, planLength } = preferences;

    // Map UI cardio type names to activityType enum values
    const cardioTypeMap: Record<string, string> = {
      "Running": "run",
      "Cycling": "cycle", 
      "Walking": "walk",
      "Swimming": "swim"
    };
    
    const mappedCardioTypes = cardioType.map(type => cardioTypeMap[type] || type.toLowerCase());

    // Calculate total activities per week
    const totalClassesPerWeek = shortClassesPerWeek + mediumClassesPerWeek + longClassesPerWeek;
    const totalWorkoutsPerWeek = shortWorkoutsPerWeek + mediumWorkoutsPerWeek + longWorkoutsPerWeek;
    const cardioWorkoutsPerWeek = isCardioWorkout ? additionalCardioWorkouts.length : 0;
    const totalActivitiesPerWeek = totalClassesPerWeek + totalWorkoutsPerWeek + cardioWorkoutsPerWeek;

    // Build a comprehensive prompt based on user preferences
    // Extract just the number from planLength (e.g., "3 weeks" -> "3")
    const weekCount = planLength.split(' ')[0];

    let prompt = `Create a ${weekCount}-week personalised workout plan with the following specifications:\n\n`;

    // Add workout specifications (including cardio)
    if (totalWorkoutsPerWeek > 0 || cardioWorkoutsPerWeek > 0) {
      const totalWorkouts = totalWorkoutsPerWeek + cardioWorkoutsPerWeek;
      prompt += `WORKOUTS (${totalWorkouts} per week):\n`;
      if (shortWorkoutsPerWeek > 0) prompt += `- ${shortWorkoutsPerWeek} short ${mappedCardioTypes.length > 0 ? mappedCardioTypes.join("/") : "cardio"} workouts (10-20 minutes each)\n`;
      if (mediumWorkoutsPerWeek > 0) prompt += `- ${mediumWorkoutsPerWeek} medium ${mappedCardioTypes.length > 0 ? mappedCardioTypes.join("/") : "cardio"} workouts (20-30 minutes each)\n`;
      if (longWorkoutsPerWeek > 0) prompt += `- ${longWorkoutsPerWeek} long ${mappedCardioTypes.length > 0 ? mappedCardioTypes.join("/") : "cardio"} workouts (30+ minutes each)\n`;
      
      if (mappedCardioTypes.length > 0) {
        prompt += `\nIMPORTANT: All workouts above should be ONLY ${mappedCardioTypes.join(" OR ")} activities. Do not include any other activity types.\n`;
      }
    }

    // Add class specifications
    if (totalClassesPerWeek > 0) {
      prompt += `\nCLASSES (${totalClassesPerWeek} per week):\n`;
      if (shortClassesPerWeek > 0) prompt += `- ${shortClassesPerWeek} short classes (10-20 minutes each)\n`;
      if (mediumClassesPerWeek > 0) prompt += `- ${mediumClassesPerWeek} medium classes (20-30 minutes each)\n`;
      if (longClassesPerWeek > 0) prompt += `- ${longClassesPerWeek} long classes (30+ minutes each)\n`;
    }

    prompt += `\nTOTAL: ${totalActivitiesPerWeek} activities per week for ${weekCount} weeks.`;

    // Add additional notes if provided
    if (additionalNotes?.trim()) {
      prompt += `\n\nADDITIONAL PREFERENCES: ${additionalNotes}`;
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