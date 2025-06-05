import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function useGeneratePlan() {
  const router = useRouter();
  const utils = api.useUtils();

  const generatePlanMutation = api.workoutPlan.generatePlan.useMutation({
    onError: (error) => {
      if (error.message === "Onboarding is not completed") {
        router.push("/onboarding");
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
  };
}

