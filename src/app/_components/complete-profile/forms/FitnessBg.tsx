import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DEFAULT_EXERCISE_OPTIONS, EXERCISE_FREQUENCY, FITNESS_LEVEL, SESSION_LENGTH } from "@/app/_constants/fitness";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import type { MissingFieldsGrouped } from "../../dashboard/MultiStepGeneratePlanDialog";
import { DialogFooter } from "@/components/ui/dialog";

// Define proper types for the form data
type FitnessLevel = typeof FITNESS_LEVEL[number];
type ExerciseFrequency = typeof EXERCISE_FREQUENCY[number];
type SessionLength = typeof SESSION_LENGTH[number];

interface FitnessBackgroundSubmitData {
  fitnessLevel: FitnessLevel | null;
  exercises: string[];
  otherExercises: string[] | null;
  exerciseFrequency: ExerciseFrequency | null;
  sessionLength: SessionLength | null;
}

export default function FitnessBackgroundForm({
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
  const { mutate: postFitnessBackground } = api.onboarding.postFitnessBackground.useMutation({
    onSuccess: () => {
      toast.success("Fitness background saved successfully");
      utils.onboarding.getOnboardingData.invalidate();
      onNext();
    },
    onError: () => {
      toast.error("Failed to save fitness background");
    }
  });

  // Get fitness missing fields - much simpler!
  const fitnessMissingFields = missingFields?.fitness || [];
  const hasMissingFields = fitnessMissingFields.length > 0;

  // Create dynamic schema based on missingFields
  const createSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    // Helper function to check if field is required
    const isRequired = (fieldName: string) => {
      return hasMissingFields && fitnessMissingFields.includes(fieldName);
    };

    // Fitness level field
    if (isRequired('fitnessLevel')) {
      schemaFields.fitnessLevel = z.enum(FITNESS_LEVEL, {
        required_error: "Please select your fitness level",
      });
    } else {
      schemaFields.fitnessLevel = z.enum(FITNESS_LEVEL).optional();
    }

    // Exercises field
    if (isRequired('exercises')) {
      schemaFields.exercises = z.array(z.string()).min(1, "Please select at least one exercise");
    } else {
      schemaFields.exercises = z.array(z.string()).optional();
    }

    // Custom exercise field (for "Other" option)
    schemaFields.customExercise = z.string().optional();

    // Exercise frequency field
    if (isRequired('exerciseFrequency')) {
      schemaFields.exerciseFrequency = z.enum(EXERCISE_FREQUENCY, {
        required_error: "Please select your exercise frequency",
      });
    } else {
      schemaFields.exerciseFrequency = z.enum(EXERCISE_FREQUENCY).optional();
    }

    // Session length field
    if (isRequired('sessionLength')) {
      schemaFields.sessionLength = z.enum(SESSION_LENGTH, {
        required_error: "Please select your session length",
      });
    } else {
      schemaFields.sessionLength = z.enum(SESSION_LENGTH).optional();
    }

    return z.object(schemaFields);
  };

  const fitnessBackgroundSchema = createSchema();
  type FitnessBackgroundFormData = z.infer<typeof fitnessBackgroundSchema>;

  const { handleSubmit, formState: { errors }, control, watch, setValue } = useForm<FitnessBackgroundFormData>({
    resolver: zodResolver(fitnessBackgroundSchema),
    mode: "onChange",
    defaultValues: {
      fitnessLevel: undefined,
      exercises: [],
      customExercise: undefined,
      exerciseFrequency: undefined,
      sessionLength: undefined,
    }
  });

  const handleExerciseChange = (exercise: string) => {
    const currentExercises = watch("exercises") || [];
    if (Array.isArray(currentExercises)) {
      const newExercises = currentExercises.includes(exercise)
        ? currentExercises.filter((e: string) => e !== exercise)
        : [...currentExercises, exercise];
      setValue("exercises", newExercises);
    }
  };

  const onSubmit = async (data: FitnessBackgroundFormData) => {
    // Build submit data with proper types, only including fields that have values
    const submitData: Partial<FitnessBackgroundSubmitData> = {};

    if (data.fitnessLevel !== undefined) {
      submitData.fitnessLevel = data.fitnessLevel as FitnessLevel;
    }
    if (data.exercises && Array.isArray(data.exercises) && data.exercises.length > 0) {
      submitData.exercises = data.exercises as string[];
      // Handle "Other" exercises
      if (data.exercises.includes("Other") && data.customExercise) {
        submitData.otherExercises = [data.customExercise];
      }
    }
    if (data.exerciseFrequency !== undefined) {
      submitData.exerciseFrequency = data.exerciseFrequency as ExerciseFrequency;
    }
    if (data.sessionLength !== undefined) {
      submitData.sessionLength = data.sessionLength as SessionLength;
    }

    // Only submit if there's actual data
    if (Object.keys(submitData).length > 0) {
      // Ensure all required fields are present for the API
      const apiData: FitnessBackgroundSubmitData = {
        fitnessLevel: submitData.fitnessLevel || null,
        exercises: submitData.exercises || [],
        otherExercises: submitData.otherExercises || null,
        exerciseFrequency: submitData.exerciseFrequency || null,
        sessionLength: submitData.sessionLength || null,
      };
      postFitnessBackground(apiData);
    } else {
      // If no data to submit, just proceed to next step
      onNext();
    }
  };

  const handleNext = async () => {
    handleSubmit(onSubmit)();
  };

  // If no missing fields for fitness, show a message
  if (!hasMissingFields) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Fitness Background</h3>
          <p className="text-sm text-gray-500">Your fitness background information is already complete!</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            All required fitness background information has been provided. You can proceed to the next step.
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
        <h3 className="text-lg font-semibold text-gray-900">Fitness Background</h3>
        <p className="text-sm text-gray-500">Tell us about your fitness background and experience</p>
      </div>

      <div className="space-y-4">
        {fitnessMissingFields.includes('fitnessLevel') && (
          <div>
            <label htmlFor="fitness-level" className="mb-2 block text-sm font-medium text-gray-700">
              What is your current fitness level?
            </label>
            {errors.fitnessLevel && (
              <p className="mt-1 text-sm text-red-600">{typeof errors.fitnessLevel?.message === 'string' ? errors.fitnessLevel.message : 'Invalid input'}</p>
            )}
            <Controller
              name="fitnessLevel"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value: FitnessLevel) => field.onChange(value)}
                  value={field.value || ""}
                  defaultValue={field.value || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select fitness level" />
                  </SelectTrigger>
                  <SelectContent>
                    {FITNESS_LEVEL.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {fitnessMissingFields.includes('exercises') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What types of exercise do you currently do?
            </label>
            {errors.exercises && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.exercises?.message === 'string' ? errors.exercises.message : 'Invalid input'}</p>
            )}
            <Controller
              name="exercises"
              control={control}
              render={({ field }) => (
                <MultiSelectPills
                  options={DEFAULT_EXERCISE_OPTIONS}
                  selectedValues={field.value || []}
                  onChange={handleExerciseChange}
                />
              )}
            />
          </div>
        )}
        {(() => {
          const exercises = watch("exercises");
          return Array.isArray(exercises) && exercises.includes("Other") ? (
            <Input
              placeholder="Add custom exercise"
              value={watch("customExercise") ?? ""}
              onChange={(e) => setValue("customExercise", e.target.value || undefined)}
              className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
              style={{ height: "44px", fontSize: "15px" }}
            />
          ) : null;
        })()}

        {fitnessMissingFields.includes('exerciseFrequency') && (
          <div>
            <label htmlFor="exercise-frequency" className="mb-2 block text-sm font-medium text-gray-700">
              How often do you exercise?
            </label>
            {errors.exerciseFrequency && (
              <p className="mt-1 text-sm text-red-600">{typeof errors.exerciseFrequency?.message === 'string' ? errors.exerciseFrequency.message : 'Invalid input'}</p>
            )}
            <Controller
              name="exerciseFrequency"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value: ExerciseFrequency) => field.onChange(value)}
                  value={field.value || ""}
                  defaultValue={field.value || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISE_FREQUENCY.map((frequency) => (
                      <SelectItem key={frequency} value={frequency}>{frequency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {fitnessMissingFields.includes('sessionLength') && (
          <div>
            <label htmlFor="session-length" className="mb-2 block text-sm font-medium text-gray-700">
              How long are your typical workout sessions?
            </label>
            {errors.sessionLength && (
              <p className="mt-1 text-sm text-red-600">{typeof errors.sessionLength?.message === 'string' ? errors.sessionLength.message : 'Invalid input'}</p>
            )}
            <Controller
              name="sessionLength"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value: SessionLength) => field.onChange(value)}
                  value={field.value || ""}
                  defaultValue={field.value || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select session length" />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_LENGTH.map((length) => (
                      <SelectItem key={length} value={length}>{length}</SelectItem>
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