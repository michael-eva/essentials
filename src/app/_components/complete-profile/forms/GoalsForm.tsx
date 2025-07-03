import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { GOAL_TIMELINE, GOALS } from "@/app/_constants/goals";
import { Button } from "@/components/ui/button";
import type { MissingFieldsGrouped } from "../../dashboard/MultiStepGeneratePlanDialog";
import { DialogFooter } from "@/components/ui/dialog";

export default function GoalsFormComplete({
  missingFields,
  isSubmitting,
  onNext,
  onPrevious
}: {
  missingFields?: MissingFieldsGrouped;
  isSubmitting?: boolean;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const utils = api.useUtils();
  const { mutate: postFitnessGoals } = api.onboarding.postFitnessGoals.useMutation({
    onSuccess: () => {
      toast.success("Goals saved successfully");
      utils.onboarding.getOnboardingData.invalidate();
      onNext();
    },
    onError: () => {
      toast.error("Failed to save goals");
    }
  });

  // Get goals missing fields - much simpler!
  const goalsMissingFields = missingFields?.goals || [];
  const hasMissingFields = goalsMissingFields.length > 0;

  // Create dynamic schema based on missingFields
  const createSchema = () => {
    const schemaFields: Record<string, any> = {};

    // Helper function to check if field is required
    const isRequired = (fieldName: string) => {
      return hasMissingFields && goalsMissingFields.includes(fieldName);
    };

    // Fitness goals field
    if (isRequired('fitnessGoals')) {
      schemaFields.fitnessGoals = z.array(z.string()).min(1, "Please select at least one goal");
    } else {
      schemaFields.fitnessGoals = z.array(z.string()).optional();
    }

    // Goal timeline field
    if (isRequired('goalTimeline')) {
      schemaFields.goalTimeline = z.enum(GOAL_TIMELINE, {
        required_error: "Please select your goal timeline",
      });
    } else {
      schemaFields.goalTimeline = z.enum(GOAL_TIMELINE).optional();
    }

    return z.object(schemaFields);
  };

  const goalsSchema = createSchema();
  type GoalsFormData = z.infer<typeof goalsSchema>;

  const { handleSubmit, formState: { errors }, control, watch, setValue } = useForm<GoalsFormData>({
    resolver: zodResolver(goalsSchema),
    mode: "onChange",
    defaultValues: {
      fitnessGoals: [],
      goalTimeline: undefined,
    }
  });

  const handleGoalChange = (goal: string) => {
    const currentGoals = watch("fitnessGoals") || [];
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter((g: string) => g !== goal)
      : [...currentGoals, goal];
    setValue("fitnessGoals", newGoals);
  };

  const onSubmit = async (data: GoalsFormData) => {
    // Build submit data object dynamically, only including fields with actual data
    const submitData: any = {};

    // Only include fields that have values
    if (data.fitnessGoals && data.fitnessGoals.length > 0) {
      submitData.fitnessGoals = data.fitnessGoals;
    }

    if (data.goalTimeline !== undefined && data.goalTimeline !== null) {
      submitData.goalTimeline = data.goalTimeline;
    }

    // Only call API if there's actual data to submit
    if (Object.keys(submitData).length > 0) {
      postFitnessGoals(submitData);
    } else {
      // No data to submit, proceed to next step
      onNext();
    }
  };

  const handleNext = async () => {
    handleSubmit(onSubmit)();
  };

  // If no missing fields for goals, show a message
  if (!hasMissingFields) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Goals & Timeline</h3>
          <p className="text-sm text-gray-500">Your goals and timeline information is already complete!</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            All required goals and timeline information has been provided. You can proceed to the next step.
          </p>
        </div>
        <DialogFooter className="gap-2 sm:justify-center">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isSubmitting}
              className="w-1/2"
            >
              Previous
            </Button>
            <Button
              onClick={onNext}
              disabled={isSubmitting}
              className="w-1/2"
            >
              Continue
            </Button>
          </div>
        </DialogFooter>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Goals & Timeline</h3>
        <p className="text-sm text-gray-500">Tell us about your fitness goals and timeline</p>
      </div>

      <div className="space-y-4">
        {goalsMissingFields.includes('fitnessGoals') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What are your primary fitness goals?
            </label>
            {errors.fitnessGoals && (
              <p className="mb-2 text-sm text-red-600">{errors.fitnessGoals.message?.toString()}</p>
            )}
            <Controller
              name="fitnessGoals"
              control={control}
              render={({ field }) => (
                <MultiSelectPills
                  options={GOALS}
                  selectedValues={field.value || []}
                  onChange={handleGoalChange}
                />
              )}
            />
          </div>
        )}

        {goalsMissingFields.includes('goalTimeline') && (
          <div>
            <label htmlFor="goal-timeline" className="mb-2 block text-sm font-medium text-gray-700">
              What is your timeline for achieving these goals?
            </label>
            {errors.goalTimeline && (
              <p className="mt-1 text-sm text-red-600">{errors.goalTimeline.message?.toString()}</p>
            )}
            <Controller
              name="goalTimeline"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_TIMELINE.map((timeline) => (
                      <SelectItem key={timeline} value={timeline}>{timeline}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}
      </div>

      <DialogFooter className="gap-2 sm:justify-center">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isSubmitting}
            className="w-1/2"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="w-1/2"
          >
            {isSubmitting ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </DialogFooter>
    </div>
  );
} 