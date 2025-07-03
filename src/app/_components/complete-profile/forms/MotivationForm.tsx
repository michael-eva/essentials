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

// Define proper types for the form data
type MotivationFactor = typeof MOTIVATION_FACTORS[number];
type ProgressTrackingMethod = typeof PROGRESS_TRACKING_METHODS[number];

interface MotivationSubmitData {
  motivation: MotivationFactor[];
  otherMotivation: string[] | undefined;
  progressTracking: ProgressTrackingMethod[];
  otherProgressTracking: string[] | undefined;
}

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
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    // Helper function to check if field is required
    const isRequired = (fieldName: string) => {
      return hasMissingFields && motivationMissingFields.includes(fieldName);
    };

    // Motivation factors field
    if (isRequired('motivation')) {
      schemaFields.motivation = z.array(z.string()).min(1, "Please select at least one motivation factor");
    } else {
      schemaFields.motivation = z.array(z.string()).optional();
    }

    // Other motivation field (optional)
    schemaFields.otherMotivation = z.array(z.string()).optional();

    // Progress tracking field
    if (isRequired('progressTracking')) {
      schemaFields.progressTracking = z.array(z.string()).min(1, "Please select at least one progress tracking method");
    } else {
      schemaFields.progressTracking = z.array(z.string()).optional();
    }

    // Other progress tracking field (optional)
    schemaFields.otherProgressTracking = z.array(z.string()).optional();

    return z.object(schemaFields);
  };

  const motivationSchema = createSchema();
  type MotivationFormData = z.infer<typeof motivationSchema>;

  const { handleSubmit, formState: { errors }, control, watch, setValue } = useForm<MotivationFormData>({
    resolver: zodResolver(motivationSchema),
    mode: "onChange",
    defaultValues: {
      motivation: [],
      otherMotivation: [],
      progressTracking: [],
      otherProgressTracking: [],
    }
  });

  const handleMotivationChange = (factor: string) => {
    const currentMotivation = watch("motivation") || [];
    if (Array.isArray(currentMotivation)) {
      const newMotivation = currentMotivation.includes(factor)
        ? currentMotivation.filter((f: string) => f !== factor)
        : [...currentMotivation, factor];
      setValue("motivation", newMotivation);
    }
  };

  const handleProgressTrackingChange = (method: string) => {
    const currentTracking = watch("progressTracking") || [];
    if (Array.isArray(currentTracking)) {
      const newTracking = currentTracking.includes(method)
        ? currentTracking.filter((m: string) => m !== method)
        : [...currentTracking, method];
      setValue("progressTracking", newTracking);
    }
  };

  const onSubmit = async (data: MotivationFormData) => {
    // Build submit data with proper types, only including fields that have values
    const submitData: Partial<MotivationSubmitData> = {};

    if (data.motivation && Array.isArray(data.motivation) && data.motivation.length > 0) {
      submitData.motivation = data.motivation as MotivationFactor[];
      // Handle "Other" motivation
      if (data.motivation.includes("Other") && data.otherMotivation && Array.isArray(data.otherMotivation) && data.otherMotivation.length > 0) {
        submitData.otherMotivation = data.otherMotivation;
      }
    }

    if (data.progressTracking && Array.isArray(data.progressTracking) && data.progressTracking.length > 0) {
      submitData.progressTracking = data.progressTracking as ProgressTrackingMethod[];
      // Handle "Other" progress tracking
      if (data.progressTracking.includes("Other") && data.otherProgressTracking && Array.isArray(data.otherProgressTracking) && data.otherProgressTracking.length > 0) {
        submitData.otherProgressTracking = data.otherProgressTracking;
      }
    }

    // Only submit if there's actual data
    if (Object.keys(submitData).length > 0) {
      // Ensure all required fields are present for the API
      const apiData: MotivationSubmitData = {
        motivation: submitData.motivation || [],
        otherMotivation: submitData.otherMotivation ?? undefined,
        progressTracking: submitData.progressTracking || [],
        otherProgressTracking: submitData.otherProgressTracking ?? undefined,
      };
      postMotivation(apiData);
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
          <p className="text-sm text-gray-500">Your motivation preferences are already complete!</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            All required motivation information has been provided. You can proceed to the next step.
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
        <p className="text-sm text-gray-500">Tell us what motivates you and how you like to track your progress</p>
      </div>

      <div className="space-y-4">
        {motivationMissingFields.includes('motivation') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What motivates you to stay active and healthy?
            </label>
            {errors.motivation && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.motivation?.message === 'string' ? errors.motivation.message : 'Invalid input'}</p>
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

        {(() => {
          const motivation = watch("motivation");
          return Array.isArray(motivation) && motivation.includes("Other") ? (
            <div>
              <label htmlFor="other-motivation" className="block text-sm font-medium text-gray-700 mb-2">
                Please specify other motivation factors
              </label>
              <Input
                id="other-motivation"
                placeholder="Add custom motivation factor"
                value={(() => {
                  const otherMotivation = watch("otherMotivation");
                  return Array.isArray(otherMotivation) && otherMotivation.length > 0 ? otherMotivation[0] as string : "";
                })()}
                onChange={(e) => setValue("otherMotivation", [e.target.value])}
                className="w-full"
              />
            </div>
          ) : null;
        })()}

        {motivationMissingFields.includes('progressTracking') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              How do you prefer to track your progress?
            </label>
            {errors.progressTracking && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.progressTracking?.message === 'string' ? errors.progressTracking.message : 'Invalid input'}</p>
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

        {(() => {
          const progressTracking = watch("progressTracking");
          return Array.isArray(progressTracking) && progressTracking.includes("Other") ? (
            <div>
              <label htmlFor="other-progress-tracking" className="block text-sm font-medium text-gray-700 mb-2">
                Please specify other progress tracking methods
              </label>
              <Input
                id="other-progress-tracking"
                placeholder="Add custom tracking method"
                value={(() => {
                  const otherProgressTracking = watch("otherProgressTracking");
                  return Array.isArray(otherProgressTracking) && otherProgressTracking.length > 0 ? otherProgressTracking[0] as string : "";
                })()}
                onChange={(e) => setValue("otherProgressTracking", [e.target.value])}
                className="w-full"
              />
            </div>
          ) : null;
        })()}
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