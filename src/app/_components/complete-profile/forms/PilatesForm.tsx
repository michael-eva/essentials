import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { PILATES_APPARATUS, PILATES_DURATION, PILATES_STYLES } from "@/app/_constants/pilates";
import { Button } from "@/components/ui/button";
import type { MissingFieldsGrouped } from "../../dashboard/MultiStepGeneratePlanDialog";
import { DialogFooter } from "@/components/ui/dialog";
import { FITNESS_LEVEL } from "@/app/_constants/fitness";
import { handleNoneMultiSelect } from "@/app/_utils/multiSelectNoneUtils";
import { Textarea } from "@/components/ui/textarea";
import { GOALS } from "@/app/_constants/goals";
import Input from "@/app/_components/global/Input";

// Define proper types for the form data
type PilatesDuration = typeof PILATES_DURATION[number];
type PilatesApparatus = typeof PILATES_APPARATUS[number];
type CustomPilatesApparatus = typeof PILATES_APPARATUS[number];
type PilatesFitnessLevel = typeof FITNESS_LEVEL[number];

interface PilatesSubmitData {
  fitnessLevel: PilatesFitnessLevel | null;
  pilatesExperience: boolean | null;
  pilatesDuration: PilatesDuration | null;
  pilatesStyles: string[];
  homeEquipment: string[];
  fitnessGoals: string[];
  otherFitnessGoals: string[];
  specificGoals: string | null;
}

export default function PilatesForm({
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
  const [customGoalInput, setCustomGoalInput] = useState("");
  const [customGoals, setCustomGoals] = useState<string[]>([]);

  const { mutate: postPilatesExperience } = api.onboarding.postPilatesExperience.useMutation({
    onSuccess: () => {
      toast.success("Pilates experience saved successfully");
      utils.onboarding.getOnboardingData.invalidate();
      onNext();
    },
    onError: () => {
      toast.error("Failed to save pilates experience");
    }
  });

  // Get pilates missing fields - much simpler!
  const pilatesMissingFields = missingFields?.pilates || [];
  const hasMissingFields = pilatesMissingFields.length > 0;
  console.log(pilatesMissingFields);
  console.log(hasMissingFields);

  // Create dynamic schema based on missingFields
  const createSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    // Helper function to check if field is required
    const isRequired = (fieldName: string) => {
      return hasMissingFields && pilatesMissingFields.includes(fieldName);
    };

    // Fitness level field
    if (isRequired('fitnessLevel')) {
      schemaFields.fitnessLevel = z.enum(FITNESS_LEVEL, {
        required_error: "Fitness level is required",
      });
    } else {
      schemaFields.fitnessLevel = z.enum(FITNESS_LEVEL).optional();
    }

    // Pilates experience field
    if (isRequired('pilatesExperience')) {
      schemaFields.pilatesExperience = z.boolean({
        required_error: "Please indicate if you have Pilates experience",
      });
    } else {
      schemaFields.pilatesExperience = z.boolean().optional();
    }

    // Pilates duration field (optional)
    if (isRequired('pilatesDuration')) {
      schemaFields.pilatesDuration = z.enum(PILATES_DURATION).optional();
    } else {
      schemaFields.pilatesDuration = z.enum(PILATES_DURATION).optional();
    }

    // Pilates styles field (optional)
    if (isRequired('pilatesStyles')) {
      schemaFields.pilatesStyles = z.array(z.string(), {
        required_error: "Pilates styles are required",
      });
    } else {
      schemaFields.pilatesStyles = z.array(z.string()).optional();
    }

    // Home equipment field (optional)
    if (isRequired('homeEquipment')) {
      schemaFields.homeEquipment = z.array(z.string(), {
        required_error: "Home equipment is required",
      });
    } else {
      schemaFields.homeEquipment = z.array(z.string()).optional();
    }

    // Fitness goals field (required)
    if (isRequired('fitnessGoals')) {
      schemaFields.fitnessGoals = z.array(z.string()).min(1, "Please select at least one goal");
    } else {
      schemaFields.fitnessGoals = z.array(z.string()).optional();
    }

    // Other fitness goals field (optional)
    if (isRequired('otherFitnessGoals')) {
      schemaFields.otherFitnessGoals = z.array(z.string(), {
        required_error: "Other fitness goals are required",
      });
    } else {
      schemaFields.otherFitnessGoals = z.array(z.string()).optional();
    }

    // Specific goals field (optional)
    if (isRequired('specificGoals')) {
      schemaFields.specificGoals = z.string({
        required_error: "Specific goals are required",
      });
    } else {
      schemaFields.specificGoals = z.string().optional();
    }

    return z.object(schemaFields);
  };

  const pilatesSchema = createSchema();
  type PilatesFormData = z.infer<typeof pilatesSchema>;

  const { handleSubmit, formState: { errors }, control, watch, setValue } = useForm<PilatesFormData>({
    resolver: zodResolver(pilatesSchema),
    mode: "onChange",
    defaultValues: {
      fitnessLevel: undefined,
      pilatesExperience: undefined,
      pilatesDuration: undefined,
      pilatesStyles: [],
      homeEquipment: [],
      fitnessGoals: [],
      otherFitnessGoals: [],
      specificGoals: undefined,
    }
  });

  const pilatesExperience = watch("pilatesExperience");

  const handleHomeEquipmentChange = (equipment: string) => {
    const currentEquipment = watch("homeEquipment") ?? [];
    const newEquipment = handleNoneMultiSelect(currentEquipment, equipment);
    setValue("homeEquipment", newEquipment);
  };

  const handlePilatesStylesChange = (style: string) => {
    const currentStyles = watch("pilatesStyles") ?? [];
    const newStyles = handleNoneMultiSelect(currentStyles, style);
    setValue("pilatesStyles", newStyles);
  };

  const handleFitnessGoalsChange = (goal: string) => {
    const currentGoals = watch("fitnessGoals");
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter((g: string) => g !== goal)
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


  const onSubmit = async (data: PilatesFormData) => {
    console.log("data", data);
    // Build submit data with proper types, only including fields that are in missingFields
    const submitData: Partial<PilatesSubmitData> = {};

    // Only include fields that are actually being collected (in missingFields)
    if (pilatesMissingFields.includes('fitnessLevel') && data.fitnessLevel !== undefined) {
      submitData.fitnessLevel = data.fitnessLevel;
    }
    if (pilatesMissingFields.includes('pilatesExperience') && data.pilatesExperience !== undefined) {
      submitData.pilatesExperience = data.pilatesExperience;
    }
    if (pilatesMissingFields.includes('pilatesDuration') && data.pilatesExperience === true && data.pilatesDuration !== undefined) {
      submitData.pilatesDuration = data.pilatesDuration as PilatesDuration;
    }
    if (pilatesMissingFields.includes('pilatesStyles') && data.pilatesStyles && Array.isArray(data.pilatesStyles) && data.pilatesStyles.length > 0) {
      submitData.pilatesStyles = data.pilatesStyles;
    }
    if (pilatesMissingFields.includes('homeEquipment') && data.homeEquipment && Array.isArray(data.homeEquipment) && data.homeEquipment.length > 0) {
      submitData.homeEquipment = data.homeEquipment;
    }
    if (pilatesMissingFields.includes('fitnessGoals') && data.fitnessGoals && Array.isArray(data.fitnessGoals) && data.fitnessGoals.length > 0) {
      submitData.fitnessGoals = data.fitnessGoals;
    }
    if (pilatesMissingFields.includes('otherFitnessGoals') && data.otherFitnessGoals && Array.isArray(data.otherFitnessGoals) && data.otherFitnessGoals.length > 0) {
      submitData.otherFitnessGoals = data.otherFitnessGoals;
    }
    if (pilatesMissingFields.includes('specificGoals') && data.specificGoals !== undefined) {
      submitData.specificGoals = data.specificGoals;
    }
    console.log("submitData", submitData);
    // Only submit if theresactual data
    if (Object.keys(submitData).length > 0) {
      console.log("submitData", submitData);
      // Create a properly typed payload with only the fields were updating
      const apiPayload = {
        ...submitData,
        // Ensure array fields are never undefined
        ...(submitData.fitnessGoals && { fitnessGoals: submitData.fitnessGoals }),
        ...(submitData.pilatesStyles && { pilatesStyles: submitData.pilatesStyles }),
        ...(submitData.homeEquipment && { homeEquipment: submitData.homeEquipment }),
        ...(submitData.otherFitnessGoals && { otherFitnessGoals: submitData.otherFitnessGoals }),
        // Convert null to undefined for specificGoals
        ...(submitData.specificGoals !== undefined && submitData.specificGoals !== null && { specificGoals: submitData.specificGoals }),
      };
      console.log("apiPayload", apiPayload);
      postPilatesExperience(apiPayload as Parameters<typeof postPilatesExperience>[0]);
    } else {
      // If no data to submit, just proceed to next step
      onNext();
    }
  };

  const handleNext = async () => {
    console.log("handleNext");
    handleSubmit(onSubmit)();
  };

  // If no missing fields for pilates, show a message
  if (!hasMissingFields) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pilates Experience</h3>
          <p className="text-sm text-gray-500">Your pilates experience information is already complete!</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            All required pilates experience information has been provided. You can proceed to the next step.
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
        <h3 className="text-lg font-semibold text-gray-900">Pilates Preferences</h3>
        <p className="text-sm text-gray-500">Tell us about your pilates experience and preferences</p>
      </div>

      <div className="space-y-8">
        {pilatesMissingFields.includes('fitnessLevel') && (
          <div>
            <label
              htmlFor="fitness-level"
              className="mb-2 block text-base font-medium text-gray-700"
            >
              How would you rate your current fitness level?
            </label>
            {errors.fitnessLevel && (
              <p className="mt-1 text-sm text-red-600">{typeof errors.fitnessLevel?.message === 'string' ? errors.fitnessLevel.message : 'Invalid input'}</p>
            )}
            <Controller
              name="fitnessLevel"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value: PilatesFitnessLevel) => field.onChange(value)}
                  value={field.value || ""}
                  defaultValue={field.value || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[80%]">
                    {FITNESS_LEVEL.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {pilatesMissingFields.includes('pilatesExperience') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Have you practiced Pilates before?
            </label>
            {errors.pilatesExperience && (
              <p className="mt-1 text-sm text-red-600">{typeof errors.pilatesExperience?.message === 'string' ? errors.pilatesExperience.message : 'Invalid input'}</p>
            )}
            <Controller
              name="pilatesExperience"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={field.value !== null && field.value !== undefined ? String(field.value) : ""}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="pilates-yes" />
                    <label htmlFor="pilates-yes" className="text-sm">Yes</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="pilates-no" />
                    <label htmlFor="pilates-no" className="text-sm">No</label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        )}

        {pilatesExperience && (
          <div>
            <label htmlFor="pilates-duration" className="block text-sm font-medium text-gray-700 mb-2">
              How long have you been practicing Pilates?
            </label>
            {errors.pilatesDuration && (
              <p className="mt-1 text-sm text-red-600">{typeof errors.pilatesDuration?.message === 'string' ? errors.pilatesDuration.message : 'Invalid input'}</p>
            )}
            <Controller
              name="pilatesDuration"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value: PilatesDuration) => field.onChange(value)}
                  value={field.value || ""}
                  defaultValue={field.value || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {PILATES_DURATION.map((duration) => (
                      <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        <div>
          {pilatesMissingFields.includes('pilatesStyles') && <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What styles do you enjoy? (Select multiple)
            </label>
            {errors.pilatesStyles && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.pilatesStyles?.message === 'string' ? errors.pilatesStyles.message : 'Invalid input'}</p>
            )}
            <Controller
              name="pilatesStyles"
              control={control}
              render={({ field }) => (
                <MultiSelectPills
                  options={[...PILATES_STYLES]}
                  selectedValues={field.value || []}
                  onChange={handlePilatesStylesChange}
                />
              )}
            />
          </div>}

          {pilatesMissingFields.includes('homeEquipment') && <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What equipment do you have access to? (Select multiple)
            </label>
            {errors.homeEquipment && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.homeEquipment?.message === 'string' ? errors.homeEquipment.message : 'Invalid input'}</p>
            )}
            <Controller
              name="homeEquipment"
              control={control}
              render={({ field }) => (
                <MultiSelectPills
                  options={[...PILATES_APPARATUS]}
                  selectedValues={field.value || []}
                  onChange={handleHomeEquipmentChange}
                />
              )}
            />
          </div>}

          <div className="mt-8">
            {pilatesMissingFields.includes('fitnessGoals') && <div>
              <label className="mb-4 block text-base font-medium text-gray-700">
                What are your primary fitness goals? (Select all that apply)
              </label>
              {errors.fitnessGoals && (
                <p className="mb-2 text-sm text-red-600">
                  {typeof errors.fitnessGoals.message === 'string' ? errors.fitnessGoals.message : 'Invalid input'}
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
            </div>}
            {watch("fitnessGoals")?.includes("Other") && (
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
                  <p className="mt-2 text-sm text-red-600">{typeof errors.otherFitnessGoals.message === 'string' ? errors.otherFitnessGoals.message : 'Invalid input'}</p>
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

          {pilatesMissingFields.includes('specificGoals') && <div className="mt-8">
            <label
              htmlFor="specific-goals"
              className="block text-base font-medium text-gray-700"
            >
              Do you have any specific goals or milestones?
            </label>
            {errors.specificGoals && (
              <p className="mt-1 text-sm text-red-600">
                {typeof errors.specificGoals.message === 'string' ? errors.specificGoals.message : 'Invalid input'}
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
          </div>}
        </div>

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