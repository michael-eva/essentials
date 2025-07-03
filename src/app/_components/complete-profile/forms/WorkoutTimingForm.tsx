import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { workoutTimesEnum, weekendTimesEnum } from "@/drizzle/src/db/schema";
import { Button } from "@/components/ui/button";
import type { MissingFieldsGrouped } from "../../dashboard/MultiStepGeneratePlanDialog";
import { DialogFooter } from "@/components/ui/dialog";

const WORKOUT_TIMES = workoutTimesEnum.enumValues;
const WEEKEND_TIMES = weekendTimesEnum.enumValues;

export default function WorkoutTimingForm({
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
  const { mutate: postWorkoutTiming } = api.onboarding.postWorkoutTiming.useMutation({
    onSuccess: () => {
      toast.success("Workout timing preferences saved successfully");
      utils.onboarding.getOnboardingData.invalidate();
      onNext();
    },
    onError: () => {
      toast.error("Failed to save workout timing preferences");
    }
  });

  // Get timing missing fields - much simpler!
  const timingMissingFields = missingFields?.timing || [];
  const hasMissingFields = timingMissingFields.length > 0;

  // Create dynamic schema based on missingFields
  const createSchema = () => {
    const schemaFields: Record<string, any> = {};

    // Helper function to check if field is required
    const isRequired = (fieldName: string) => {
      return hasMissingFields && timingMissingFields.includes(fieldName);
    };

    // Preferred workout times field
    if (isRequired('preferredWorkoutTimes')) {
      schemaFields.preferredWorkoutTimes = z.array(z.string()).min(1, "Please select at least one preferred workout time");
    } else {
      schemaFields.preferredWorkoutTimes = z.array(z.string()).optional();
    }

    // Avoided workout times field
    if (isRequired('avoidedWorkoutTimes')) {
      schemaFields.avoidedWorkoutTimes = z.array(z.string()).min(1, "Please select at least one time to avoid");
    } else {
      schemaFields.avoidedWorkoutTimes = z.array(z.string()).optional();
    }

    // Weekend workout times field
    if (isRequired('weekendWorkoutTimes')) {
      schemaFields.weekendWorkoutTimes = z.enum(WEEKEND_TIMES, {
        required_error: "Please select a weekend workout time",
      });
    } else {
      schemaFields.weekendWorkoutTimes = z.enum(WEEKEND_TIMES).optional();
    }

    return z.object(schemaFields);
  };

  const workoutTimingSchema = createSchema();
  type WorkoutTimingFormData = z.infer<typeof workoutTimingSchema>;

  const { handleSubmit, formState: { errors }, control, watch, setValue } = useForm<WorkoutTimingFormData>({
    resolver: zodResolver(workoutTimingSchema),
    mode: "onChange",
    defaultValues: {
      preferredWorkoutTimes: [],
      avoidedWorkoutTimes: [],
      weekendWorkoutTimes: undefined,
    }
  });

  const handlePreferredTimesChange = (time: string) => {
    const currentTimes = watch("preferredWorkoutTimes") || [];
    const newTimes = currentTimes.includes(time)
      ? currentTimes.filter((t: string) => t !== time)
      : [...currentTimes, time];
    setValue("preferredWorkoutTimes", newTimes);
  };

  const handleAvoidedTimesChange = (time: string) => {
    const currentTimes = watch("avoidedWorkoutTimes") || [];
    const newTimes = currentTimes.includes(time)
      ? currentTimes.filter((t: string) => t !== time)
      : [...currentTimes, time];
    setValue("avoidedWorkoutTimes", newTimes);
  };

  const handleWeekendTimesChange = (time: string) => {
    setValue("weekendWorkoutTimes", time as any);
  };

  const onSubmit = async (data: WorkoutTimingFormData) => {
    // Build submit data with proper types, only including fields that have values
    const submitData: any = {};

    if (data.preferredWorkoutTimes && data.preferredWorkoutTimes.length > 0) {
      submitData.preferredWorkoutTimes = data.preferredWorkoutTimes;
    }
    if (data.avoidedWorkoutTimes && data.avoidedWorkoutTimes.length > 0) {
      submitData.avoidedWorkoutTimes = data.avoidedWorkoutTimes;
    }
    if (data.weekendWorkoutTimes !== undefined) {
      submitData.weekendWorkoutTimes = data.weekendWorkoutTimes;
    }

    // Only submit if there's actual data
    if (Object.keys(submitData).length > 0) {
      postWorkoutTiming(submitData);
    } else {
      // If no data to submit, just proceed to next step
      onNext();
    }
  };

  const handleNext = async () => {
    handleSubmit(onSubmit)();
  };

  // If no missing fields for timing, show a message
  if (!hasMissingFields) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Workout Timing</h3>
          <p className="text-sm text-gray-500">Your workout timing preferences are already complete!</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            All required workout timing information has been provided. You can proceed to the next step.
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
        <h3 className="text-lg font-semibold text-gray-900">Workout Timing</h3>
        <p className="text-sm text-gray-500">
          {hasMissingFields
            ? `Please complete the following information: ${timingMissingFields.join(', ')}`
            : "Tell us about your preferred workout times and schedule"
          }
        </p>
      </div>

      <div className="space-y-4">
        {timingMissingFields.includes('preferredWorkoutTimes') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What are your preferred workout times during the week?
            </label>
            {errors.preferredWorkoutTimes && (
              <p className="mb-2 text-sm text-red-600">{errors.preferredWorkoutTimes.message?.toString()}</p>
            )}
            <Controller
              name="preferredWorkoutTimes"
              control={control}
              render={({ field }) => (
                <MultiSelectPills
                  options={WORKOUT_TIMES}
                  selectedValues={field.value || []}
                  onChange={handlePreferredTimesChange}
                />
              )}
            />
          </div>
        )}

        {timingMissingFields.includes('avoidedWorkoutTimes') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What times would you prefer to avoid for workouts?
            </label>
            {errors.avoidedWorkoutTimes && (
              <p className="mb-2 text-sm text-red-600">{errors.avoidedWorkoutTimes.message?.toString()}</p>
            )}
            <Controller
              name="avoidedWorkoutTimes"
              control={control}
              render={({ field }) => (
                <MultiSelectPills
                  options={WORKOUT_TIMES}
                  selectedValues={field.value || []}
                  onChange={handleAvoidedTimesChange}
                />
              )}
            />
          </div>
        )}

        {timingMissingFields.includes('weekendWorkoutTimes') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What are your preferred workout times on weekends?
            </label>
            {errors.weekendWorkoutTimes && (
              <p className="mb-2 text-sm text-red-600">{errors.weekendWorkoutTimes.message?.toString()}</p>
            )}
            <Controller
              name="weekendWorkoutTimes"
              control={control}
              render={({ field }) => (
                <MultiSelectPills
                  options={WEEKEND_TIMES}
                  selectedValues={field.value ? [field.value] : []}
                  onChange={handleWeekendTimesChange}
                />
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