import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function useGeneratePlan() {
  const router = useRouter();

  const generatePlanMutation = api.workoutPlan.generatePlan.useMutation({
    onError: (error) => {
      if (error.message === "Onboarding is not completed") {
        router.push("/onboarding");
      }
    },
    onSuccess: () => {
      console.log("Plan generated successfully");
    },
  });

  return {
    generatePlan: generatePlanMutation.mutate,
    isLoading: generatePlanMutation.isPending,
    error: generatePlanMutation.error,
  };
}

