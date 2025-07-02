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
import type { FitnessBackgroundField } from "../../dashboard/MultiStepGeneratePlanDialog";
import { DialogFooter } from "@/components/ui/dialog";

export default function FitnessBackgroundForm({
  missingFields,
  isSubmitting,
  onNext,
  onPrevious
}: {
  missingFields?: FitnessBackgroundField[];
  isSubmitting?: boolean;
  onNext: () => void;
  onPrevious: () => void;
}) {
  console.log(missingFields);
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

  // Create dynamic schema based on missingFields
  const createSchema = () => {
    const schemaFields: Record<string, any> = {};

    // Helper function to check if field is required
    const isRequired = (fieldName: string) => {
      return !missingFields || missingFields.includes(fieldName as FitnessBackgroundField);
    };

    // Fitness level field
    if (isRequired('fitnessLevel')) {
      schemaFields.fitnessLevel = z.string().min(1, "Fitness level is required");
    } else {
      schemaFields.fitnessLevel = z.string().optional();
    }

    // Exercises field
    if (isRequired('exercises')) {
      schemaFields.exercises = z.array(z.string()).min(1, "Please select at least one exercise");
    } else {
      schemaFields.exercises = z.array(z.string()).optional();
    }

    // Exercise frequency field
    if (isRequired('exerciseFrequency')) {
      schemaFields.exerciseFrequency = z.string().min(1, "Exercise frequency is required");
    } else {
      schemaFields.exerciseFrequency = z.string().optional();
    }

    // Session length field
    if (isRequired('sessionLength')) {
      schemaFields.sessionLength = z.string().min(1, "Session length is required");
    } else {
      schemaFields.sessionLength = z.string().optional();
    }

    // Optional fields
    schemaFields.otherExercises = z.array(z.string()).optional();
    schemaFields.customExercise = z.string().optional();

    return z.object(schemaFields);
  };

  const fitnessBackgroundSchema = createSchema();
  type FitnessBackgroundFormData = z.infer<typeof fitnessBackgroundSchema>;

  const { control, register, watch, formState: { errors }, setValue, handleSubmit } = useForm<FitnessBackgroundFormData>({
    resolver: zodResolver(fitnessBackgroundSchema),
    mode: "onChange",
    defaultValues: {
      fitnessLevel: "",
      exercises: [],
      exerciseFrequency: "",
      sessionLength: "",
      otherExercises: [],
      customExercise: "",
    },
  });

  const handleExerciseChange = (exercise: string) => {
    const currentExercises = watch("exercises") || [];
    const newExercises = currentExercises.includes(exercise)
      ? currentExercises.filter((e: string) => e !== exercise)
      : [...currentExercises, exercise];
    setValue("exercises", newExercises);
  };

  const handleCustomExercise = () => {
    const customExercise = watch("customExercise") || "";
    if (customExercise.trim()) {
      const currentOtherExercises = watch("otherExercises") || [];
      setValue("otherExercises", [...currentOtherExercises, customExercise]);
      setValue("customExercise", "");
    }
  };

  const removeOtherExercise = (exercise: string) => {
    const currentOtherExercises = watch("otherExercises") || [];
    setValue("otherExercises", currentOtherExercises.filter((e: string) => e !== exercise));
  };

  const onSubmit = async (data: FitnessBackgroundFormData) => {
    // Remove customExercise from data before sending to API
    const { customExercise, ...apiData } = data;

    // Ensure all required fields are present with proper types
    const submitData = {
      fitnessLevel: apiData.fitnessLevel || null,
      exercises: apiData.exercises || [],
      exerciseFrequency: apiData.exerciseFrequency || null,
      sessionLength: apiData.sessionLength || null,
      otherExercises: apiData.otherExercises || [],
    };

    postFitnessBackground(submitData);
  };

  const handleNext = async () => {
    handleSubmit(onSubmit)();
  };

  // If no missing fields for fitness background, show a message
  if (missingFields && missingFields.length === 0) {
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

  const otherExercises = watch("otherExercises") || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Fitness Background</h3>
        <p className="text-sm text-gray-500">
          {missingFields && missingFields.length > 0
            ? `Please complete the following information: ${missingFields.join(', ')}`
            : "Tell us about your current fitness routine"
          }
        </p>
      </div>

      <div className="space-y-4">
        {(!missingFields || missingFields.includes('fitnessLevel')) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate your current fitness level?
            </label>
            {errors.fitnessLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.fitnessLevel.message?.toString()}</p>
            )}
            <Controller
              name="fitnessLevel"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select level" />
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

        {(!missingFields || missingFields.includes('exercises')) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What forms of exercise do you currently engage in?
            </label>
            {errors.exercises && (
              <p className="mt-1 text-sm text-red-600">{errors.exercises.message?.toString()}</p>
            )}
            <div className="mt-2">
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

            {watch("exercises")?.includes("Other") && (
              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    {...register("customExercise")}
                    type="text"
                    placeholder="Add custom exercise"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleCustomExercise}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {otherExercises.length > 0 && (
                  <div className="space-y-2">
                    {otherExercises.map((exercise: string) => (
                      <div key={exercise} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <span className="text-sm text-gray-700">{exercise}</span>
                        <button
                          type="button"
                          onClick={() => removeOtherExercise(exercise)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {(!missingFields || missingFields.includes('exerciseFrequency')) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How many days per week do you currently exercise?
            </label>
            {errors.exerciseFrequency && (
              <p className="mt-1 text-sm text-red-600">{errors.exerciseFrequency.message?.toString()}</p>
            )}
            <Controller
              name="exerciseFrequency"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
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

        {(!missingFields || missingFields.includes('sessionLength')) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How long are your typical workout sessions?
            </label>
            {errors.sessionLength && (
              <p className="mt-1 text-sm text-red-600">{errors.sessionLength.message?.toString()}</p>
            )}
            <Controller
              name="sessionLength"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select duration" />
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