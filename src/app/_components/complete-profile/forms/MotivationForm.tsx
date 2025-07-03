import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { MOTIVATION_FACTORS, PROGRESS_TRACKING_METHODS } from "@/app/_constants/motivation";
import { Button } from "@/components/ui/button";
import type { MissingFieldsGrouped } from "../../dashboard/MultiStepGeneratePlanDialog";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function MotivationForm({
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
  const { mutate: postMotivation } = api.onboarding.postMotivation.useMutation({
    onSuccess: () => {
      toast.success("Motivation preferences saved successfully");
      utils.onboarding.getOnboardingData.invalidate();
      onNext();
    },
    onError: () => {
      toast.error("Failed to save motivation preferences");
    }
  });

  // Get motivation missing fields - much simpler!
  const motivationMissingFields = missingFields?.motivation || [];
  const hasMissingFields = motivationMissingFields.length > 0;

  // Create dynamic schema based on missingFields
  const createSchema = () => {
    const schemaFields: Record<string, any> = {};

    // Helper function to check if field is required
    const isRequired = (fieldName: string) => {
      return hasMissingFields && motivationMissingFields.includes(fieldName);
    };

    // Motivation field
    if (isRequired('motivation')) {
      schemaFields.motivation = z.array(z.string()).min(1, "Please select at least one motivation factor");
    } else {
      schemaFields.motivation = z.array(z.string()).optional();
    }

    // Progress tracking field
    if (isRequired('progressTracking')) {
      schemaFields.progressTracking = z.array(z.string()).min(1, "Please select at least one progress tracking method");
    } else {
      schemaFields.progressTracking = z.array(z.string()).optional();
    }

    return z.object(schemaFields);
  };

  const motivationSchema = createSchema();
  type MotivationFormData = z.infer<typeof motivationSchema>;

  const { handleSubmit, formState: { errors }, control, watch, setValue } = useForm<MotivationFormData>({
    resolver: zodResolver(motivationSchema),
    mode: "onChange",
    defaultValues: {
      motivation: [],
      progressTracking: [],
    }
  });

  const handleMotivationChange = (motivation: string) => {
    const currentMotivation = watch("motivation") || [];
    const newMotivation = currentMotivation.includes(motivation)
      ? currentMotivation.filter((m: string) => m !== motivation)
      : [...currentMotivation, motivation];
    setValue("motivation", newMotivation);
  };

  const handleProgressTrackingChange = (method: string) => {
    const currentMethods = watch("progressTracking") || [];
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter((m: string) => m !== method)
      : [...currentMethods, method];
    setValue("progressTracking", newMethods);
  };

  const onSubmit = async (data: MotivationFormData) => {
    // Build submit data with proper types, only including fields that have values
    const submitData: any = {};

    if (data.motivation && data.motivation.length > 0) {
      submitData.motivation = data.motivation;
    }
    if (data.progressTracking && data.progressTracking.length > 0) {
      submitData.progressTracking = data.progressTracking;
    }

    // Only submit if there's actual data
    if (Object.keys(submitData).length > 0) {
      postMotivation(submitData);
    } else {
      // If no data to submit, just proceed to next step
      onNext();
    }
  };

  const handleNext = async () => {
    handleSubmit(onSubmit)();
  };

  // If no missing fields for motivation, show a message
  if (!hasMissingFields) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Motivation & Progress Tracking</h3>
          <p className="text-sm text-gray-500">Your motivation and progress tracking information is already complete!</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            All required motivation and progress tracking information has been provided. You can proceed to the next step.
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
        <h3 className="text-lg font-semibold text-gray-900">Motivation & Progress Tracking</h3>
        <p className="text-sm text-gray-500">Tell us about your motivation factors and how you like to track progress</p>
      </div>

      <div className="space-y-4">
        {motivationMissingFields.includes('motivation') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What motivates you to stay active and healthy?
            </label>
            {errors.motivation && (
              <p className="mb-2 text-sm text-red-600">{errors.motivation.message?.toString()}</p>
            )}
            <Controller
              name="motivation"
              control={control}
              render={({ field }) => (
                <MultiSelectPills
                  options={MOTIVATION_FACTORS}
                  selectedValues={field.value || []}
                  onChange={handleMotivationChange}
                />
              )}
            />
          </div>
        )}
        {watch("motivation")?.includes("Other") && (
          <div className="mt-2">
            <Input
              placeholder="Add custom motivation"
              value={watch("otherMotivation")?.[0] ?? ""}
              onChange={(e) => setValue("otherMotivation", [e.target.value])}
            />
          </div>
        )}
        {motivationMissingFields.includes('progressTracking') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              How do you prefer to track your progress?
            </label>
            {errors.progressTracking && (
              <p className="mb-2 text-sm text-red-600">{errors.progressTracking.message?.toString()}</p>
            )}
            <Controller
              name="progressTracking"
              control={control}
              render={({ field }) => (
                <MultiSelectPills
                  options={PROGRESS_TRACKING_METHODS}
                  selectedValues={field.value || []}
                  onChange={handleProgressTrackingChange}
                />
              )}
            />
          </div>
        )}
        {watch("progressTracking")?.includes("Other") && (
          <div className="mt-2">
            <Input
              placeholder="Add custom tracking method"
              value={watch("otherProgressTracking")?.[0] ?? ""}
              onChange={(e) => setValue("otherProgressTracking", [e.target.value])}
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