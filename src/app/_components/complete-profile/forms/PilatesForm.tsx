import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { PILATES_APPARATUS, PILATES_DURATION, PILATES_SESSION_PREFERENCE, PILATES_SESSIONS, PILATES_APPARATUS } from "@/app/_constants/pilates";
import { Button } from "@/components/ui/button";
import type { MissingFieldsGrouped } from "../../dashboard/MultiStepGeneratePlanDialog";
import { DialogFooter } from "@/components/ui/dialog";
import { FITNESS_LEVEL } from "@/app/_constants/fitness";

// Define proper types for the form data
type PilatesDuration = typeof PILATES_DURATION[number];
type PilatesApparatus = typeof PILATES_APPARATUS[number];
type CustomPilatesApparatus = typeof PILATES_APPARATUS[number];
type PilatesFitnessLevel = typeof FITNESS_LEVEL[number];

interface PilatesSubmitData {
  fitnessLevel: PilatesFitnessLevel | null;
  pilatesExperience: boolean | null;
  pilatesDuration: PilatesDuration | null;
  apparatusPreference: PilatesApparatus[];
  customApparatus: CustomPilatesApparatus[];
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
        required_error: "Please select your fitness level",
      });
    } else {
      schemaFields.fitnessLevel = z.enum(FITNESS_LEVEL).optional();
    }

    // Pilates experience field
    if (isRequired('pilatesExperience')) {
      schemaFields.pilatesExperience = z.boolean({
        required_error: "Please select whether you have pilates experience",
      });
    } else {
      schemaFields.pilatesExperience = z.boolean().optional();
    }

    // Pilates duration field (optional)
    schemaFields.pilatesDuration = z.enum(PILATES_DURATION).optional();

    // // Studio frequency field
    // if (isRequired('studioFrequency')) {
    //   schemaFields.studioFrequency = z.enum(PILATES_SESSIONS, {
    //     required_error: "Please select your studio frequency",
    //   });
    // } else {
    //   schemaFields.studioFrequency = z.enum(PILATES_SESSIONS).optional();
    // }

    // // Session preference field
    // if (isRequired('sessionPreference')) {
    //   schemaFields.sessionPreference = z.enum(PILATES_SESSION_PREFERENCE, {
    //     required_error: "Please select your session preference",
    //   });
    // } else {
    //   schemaFields.sessionPreference = z.enum(PILATES_SESSION_PREFERENCE).optional();
    // }

    // Apparatus preference field
    if (isRequired('apparatusPreference')) {
      schemaFields.apparatusPreference = z.array(z.string()).min(1, "Please select at least one apparatus preference");
    } else {
      schemaFields.apparatusPreference = z.array(z.string()).optional();
    }

    // Custom apparatus field (optional)
    schemaFields.customApparatus = z.array(z.string()).optional();

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
      // studioFrequency: undefined,
      // sessionPreference: undefined,
      apparatusPreference: [],
      customApparatus: [],
    }
  });

  const handleApparatusChange = (apparatus: string) => {
    const currentApparatus = watch("apparatusPreference") || [];
    if (Array.isArray(currentApparatus)) {
      const newApparatus = currentApparatus.includes(apparatus)
        ? currentApparatus.filter((a: string) => a !== apparatus)
        : [...currentApparatus, apparatus];
      setValue("apparatusPreference", newApparatus);
    }
  };

  const handleCustomApparatusChange = (apparatus: string) => {
    const currentApparatus = watch("customApparatus") || [];
    if (Array.isArray(currentApparatus)) {
      const newApparatus = currentApparatus.includes(apparatus)
        ? currentApparatus.filter((a: string) => a !== apparatus)
        : [...currentApparatus, apparatus];
      setValue("customApparatus", newApparatus);
    }
  };

  const onSubmit = async (data: PilatesFormData) => {
    // Build submit data with proper types, only including fields that have values
    const submitData: Partial<PilatesSubmitData> = {};

    if (data.pilatesExperience !== undefined) {
      submitData.pilatesExperience = data.pilatesExperience;
    }
    if (data.pilatesDuration !== undefined) {
      submitData.pilatesDuration = data.pilatesDuration as PilatesDuration;
    }
    // if (data.studioFrequency !== undefined) {
    //   submitData.studioFrequency = data.studioFrequency as PilatesSessions;
    // }
    // if (data.sessionPreference !== undefined) {
    //   submitData.sessionPreference = data.sessionPreference as PilatesSessionPreference;
    // }
    if (data.apparatusPreference && Array.isArray(data.apparatusPreference) && data.apparatusPreference.length > 0) {
      submitData.apparatusPreference = data.apparatusPreference as PilatesApparatus[];
    }
    if (data.customApparatus && Array.isArray(data.customApparatus) && data.customApparatus.length > 0) {
      submitData.customApparatus = data.customApparatus as CustomPilatesApparatus[];
    }

    // Only submit if there's actual data
    if (Object.keys(submitData).length > 0) {
      // Ensure all required fields are present for the API
      const apiData: PilatesSubmitData = {
        fitnessLevel: submitData.fitnessLevel ?? null,
        pilatesExperience: submitData.pilatesExperience ?? null,
        pilatesDuration: submitData.pilatesDuration ?? null,
        // studioFrequency: submitData.studioFrequency ?? null,
        // sessionPreference: submitData.sessionPreference ?? null,
        apparatusPreference: submitData.apparatusPreference || [],
        customApparatus: submitData.customApparatus || [],
      };
      postPilatesExperience(apiData);
    } else {
      // If no data to submit, just proceed to next step
      onNext();
    }
  };

  const handleNext = async () => {
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
        <h3 className="text-lg font-semibold text-gray-900">Pilates Experience</h3>
        <p className="text-sm text-gray-500">Tell us about your pilates experience and preferences</p>
      </div>

      <div className="space-y-4">
        {pilatesMissingFields.includes('fitnessLevel') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What is your fitness level?
            </label>
            {errors.fitnessLevel && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.fitnessLevel?.message === 'string' ? errors.fitnessLevel.message : 'Invalid input'}</p>
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


        {pilatesMissingFields.includes('pilatesExperience') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Do you have any pilates experience?
            </label>
            {errors.pilatesExperience && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.pilatesExperience?.message === 'string' ? errors.pilatesExperience.message : 'Invalid input'}</p>
            )}
            <Controller
              name="pilatesExperience"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={field.value !== null && field.value !== undefined ? String(field.value) : ""}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="pilates-yes" />
                    <label htmlFor="pilates-yes" className="text-sm font-medium text-gray-700">Yes</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="pilates-no" />
                    <label htmlFor="pilates-no" className="text-sm font-medium text-gray-700">No</label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        )}

        {watch("pilatesExperience") && (
          <div>
            <label htmlFor="pilates-duration" className="block text-sm font-medium text-gray-700 mb-2">
              How long have you been practicing pilates?
            </label>
            {errors.pilatesDuration && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.pilatesDuration?.message === 'string' ? errors.pilatesDuration.message : 'Invalid input'}</p>
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

        {/* {pilatesMissingFields.includes('studioFrequency') && (
          <div>
            <label htmlFor="studio-frequency" className="block text-sm font-medium text-gray-700 mb-2">
              How often do you visit a pilates studio?
            </label>
            {errors.studioFrequency && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.studioFrequency?.message === 'string' ? errors.studioFrequency.message : 'Invalid input'}</p>
            )}
            <Controller
              name="studioFrequency"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value: PilatesSessions) => field.onChange(value)}
                  value={field.value || ""}
                  defaultValue={field.value || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {PILATES_SESSIONS.map((session) => (
                      <SelectItem key={session} value={session}>{session}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {pilatesMissingFields.includes('sessionPreference') && (
          <div>
            <label htmlFor="session-preference" className="block text-sm font-medium text-gray-700 mb-2">
              What type of pilates sessions do you prefer?
            </label>
            {errors.sessionPreference && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.sessionPreference?.message === 'string' ? errors.sessionPreference.message : 'Invalid input'}</p>
            )}
            <Controller
              name="sessionPreference"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value: PilatesSessionPreference) => field.onChange(value)}
                  value={field.value || ""}
                  defaultValue={field.value || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {PILATES_SESSION_PREFERENCE.map((preference) => (
                      <SelectItem key={preference} value={preference}>{preference}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )} */}

        {pilatesMissingFields.includes('apparatusPreference') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What pilates apparatus do you prefer?
            </label>
            {errors.apparatusPreference && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.apparatusPreference?.message === 'string' ? errors.apparatusPreference.message : 'Invalid input'}</p>
            )}
            <Controller
              name="apparatusPreference"
              control={control}
              render={({ field }) => (
                <MultiSelectPills
                  options={PILATES_APPARATUS}
                  selectedValues={field.value || []}
                  onChange={handleApparatusChange}
                />
              )}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Custom pilates apparatus (optional)
          </label>
          {errors.customApparatus && (
            <p className="mb-2 text-sm text-red-600">{typeof errors.customApparatus?.message === 'string' ? errors.customApparatus.message : 'Invalid input'}</p>
          )}
          <Controller
            name="customApparatus"
            control={control}
            render={({ field }) => (
              <MultiSelectPills
                options={PILATES_APPARATUS}
                selectedValues={field.value || []}
                onChange={handleCustomApparatusChange}
              />
            )}
          />
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