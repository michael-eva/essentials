import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useState } from "react";
import { OnboardingRequiredDialog } from "@/components/onboarding/OnboardingRequiredDialog";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function useGeneratePlan({ redirectToPlan = true } = {}) {
  const router = useRouter();
  const utils = api.useUtils();
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);

  const generatePlanMutation = api.workoutPlan.generatePlan.useMutation({
    onError: (error) => {
      if (error.message === "Onboarding is not completed") {
        setShowOnboardingDialog(true);
      } else {
        toast.error("Failed to generate plan", {
          description: error.message,
        });
      }
    },
    onSuccess: () => {
      console.log("Plan generated successfully");
      void utils.workoutPlan.getActivePlan.invalidate();
      if (redirectToPlan) {
        router.push("/dashboard/your-plan");
      }
    },
  });

  const LoadingScreen = () => {
    if (!generatePlanMutation.isPending) return null;

    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
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

  return {
    generatePlan: generatePlanMutation.mutate,
    isLoading: generatePlanMutation.isPending,
    error: generatePlanMutation.error,
    LoadingScreen,
    OnboardingDialog: (
      <OnboardingRequiredDialog
        open={showOnboardingDialog}
        onOpenChange={setShowOnboardingDialog}
      />
    ),
  };
}

