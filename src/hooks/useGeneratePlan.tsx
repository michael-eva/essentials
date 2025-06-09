import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { OnboardingRequiredDialog } from "@/components/onboarding/OnboardingRequiredDialog";

export default function useGeneratePlan() {
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
    },
  });

  return {
    generatePlan: generatePlanMutation.mutate,
    isLoading: generatePlanMutation.isPending,
    error: generatePlanMutation.error,
    OnboardingDialog: (
      <OnboardingRequiredDialog
        open={showOnboardingDialog}
        onOpenChange={setShowOnboardingDialog}
      />
    ),
  };
}

