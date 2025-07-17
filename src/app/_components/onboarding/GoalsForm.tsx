import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { STEPS } from "@/app/onboarding/constants";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FormLayout from "./FormLayout";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { api } from "@/trpc/react";
import { isDeveloper } from "@/app/_utils/user-role";
import { GOAL_TIMELINE, GOALS } from "@/app/_constants/goals";
import Input from "../global/Input";

interface GoalsFormProps {
  isFirstStep?: boolean;
  isLastStep?: boolean;
  currentStep: (typeof STEPS)[number];
}

export const formSchema = z.object({
  fitnessGoals: z.array(z.string()).min(1, "Please select at least one goal"),
  otherFitnessGoals: z.array(z.string()).optional(),
  specificGoals: z.string().optional(),
}).refine(
  (data) => {
    return !data.fitnessGoals.includes("Other") || (data.otherFitnessGoals && data.otherFitnessGoals.length > 0);
  },
  {
    message: "Please add at least one custom goal",
    path: ["otherFitnessGoals"],
  }
);

export default function GoalsForm({
  isFirstStep,
  isLastStep,
  currentStep,
}: GoalsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState("");
  const [customGoals, setCustomGoals] = useState<string[]>([]);

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      fitnessGoals: isDeveloper() ? ["Lose weight"] : [],
      specificGoals: "",
    },
  });
  const { mutate: postFitnessGoals } =
    api.onboarding.postFitnessGoals.useMutation();
  const handleFitnessGoalsChange = (goal: string) => {
    const currentGoals = watch("fitnessGoals");
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter((g) => g !== goal)
      : [...currentGoals, goal];
    setValue("fitnessGoals", newGoals);
  };


  const handleCustomGoal = () => {
    if (customGoalInput.trim()) {
      const updated = [...customGoals, customGoalInput];
      setCustomGoals(updated);
      setValue("otherFitnessGoals", updated);
      setCustomGoalInput("");
    }
  };

  const removeCustomGoal = (goal: string) => {
    const updated = customGoals.filter((g) => g !== goal);
    setCustomGoals(updated);
    setValue("otherFitnessGoals", updated);
  };

  const onSubmit = async (): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      let isValid = false;
      await handleSubmit(async (data) => {
        postFitnessGoals(data);
        isValid = true;
      })();
      return isValid;
    } catch (error) {
      console.error("Form validation failed:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      onSubmit={onSubmit}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      currentStep={currentStep}
      isSubmitting={isSubmitting}
    >
      <form className="mx-auto max-w-md space-y-8 px-2">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Your Fitness Goals
        </h2>
        <div className="space-y-8">
          <div>
            <label className="mb-4 block text-base font-medium text-gray-700">
              What are your primary fitness goals? (Select all that apply)
            </label>
            {errors.fitnessGoals && (
              <p className="mb-2 text-sm text-red-600">
                {errors.fitnessGoals.message}
              </p>
            )}
            <Controller
              name="fitnessGoals"
              control={control}
              render={({ field }) => (
                <MultiSelectPills
                  options={GOALS}
                  selectedValues={field.value}
                  onChange={handleFitnessGoalsChange}
                />
              )}
            />
            {watch("fitnessGoals").includes("Other") && (
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    value={customGoalInput}
                    onChange={(e) => setCustomGoalInput(e.target.value)}
                    type="text"
                    placeholder="Add custom goal"
                    className={`flex-1 rounded-md text-sm shadow-sm focus:ring-indigo-500 ${errors.otherFitnessGoals
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-indigo-500"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={handleCustomGoal}
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm leading-4 font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                  >
                    Add
                  </button>
                </div>
                {errors.otherFitnessGoals && (
                  <p className="mt-2 text-sm text-red-600">{errors.otherFitnessGoals.message}</p>
                )}
                <div className="mt-3 space-y-2">
                  {customGoals.map((goal) => (
                    <div key={goal} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <span className="text-sm text-gray-700">{goal}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomGoal(goal)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="specific-goals"
              className="block text-base font-medium text-gray-700"
            >
              Do you have any specific goals or milestones?
            </label>
            {errors.specificGoals && (
              <p className="mt-1 text-sm text-red-600">
                {errors.specificGoals.message}
              </p>
            )}
            <Controller
              name="specificGoals"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="specific-goals"
                  rows={3}
                  className={`mt-1 block w-full rounded-md text-sm shadow-sm focus:ring-indigo-500 ${errors.specificGoals
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-indigo-500"
                    }`}
                  placeholder="E.g., Run 5k, Lose 10kg, etc."
                />
              )}
            />
          </div>
        </div>
      </form>
    </FormLayout>
  );
}
