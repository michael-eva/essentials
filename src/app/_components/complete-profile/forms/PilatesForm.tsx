import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { PILATES_APPARATUS, PILATES_DURATION, PILATES_SESSION_PREFERENCE, PILATES_SESSIONS, CUSTOM_PILATES_APPARATUS } from "@/app/_constants/pilates";
import { Button } from "@/components/ui/button";
import type { PilatesField } from "../../dashboard/MultiStepGeneratePlanDialog";
import { DialogFooter } from "@/components/ui/dialog";

export default function PilatesForm({
  missingFields,
  isSubmitting,
  onNext,
  onPrevious
}: {
  missingFields?: PilatesField[];
  isSubmitting?: boolean;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const utils = api.useUtils();
  const { mutate: postPilatesExperience } = api.onboarding.postPilatesExperience.useMutation({
    onSuccess: () => {
      toast.success("Pilates preferences saved successfully");
      utils.onboarding.getOnboardingData.invalidate();
      onNext();
    },
    onError: () => {
      toast.error("Failed to save Pilates preferences");
    }
  });
  console.log(missingFields);
  // Create dynamic schema based on missingFields
  const createSchema = () => {
    const schemaFields: Record<string, any> = {};

    // Helper function to check if field is required
    const isRequired = (fieldName: string) => {
      return !missingFields || missingFields.includes(fieldName as PilatesField);
    };

    // Pilates experience field
    if (isRequired('pilatesExperience')) {
      schemaFields.pilatesExperience = z.boolean({
        required_error: "Please indicate if you have Pilates experience",
      });
    } else {
      schemaFields.pilatesExperience = z.boolean().optional();
    }

    // Studio frequency field
    if (isRequired('studioFrequency')) {
      schemaFields.studioFrequency = z.enum(PILATES_SESSIONS, {
        required_error: "Please select how often you can attend in-studio sessions",
      });
    } else {
      schemaFields.studioFrequency = z.enum(PILATES_SESSIONS).optional();
    }

    // Session preference field
    if (isRequired('sessionPreference')) {
      schemaFields.sessionPreference = z.enum(PILATES_SESSION_PREFERENCE, {
        required_error: "Please select your session preference",
      });
    } else {
      schemaFields.sessionPreference = z.enum(PILATES_SESSION_PREFERENCE).optional();
    }

    // Apparatus preference field
    if (isRequired('apparatusPreference')) {
      schemaFields.apparatusPreference = z.array(z.string()).min(1, "Please select at least one apparatus preference");
    } else {
      schemaFields.apparatusPreference = z.array(z.string()).optional();
    }

    // Pilates duration field
    if (isRequired('pilatesDuration')) {
      schemaFields.pilatesDuration = z.enum(PILATES_DURATION, {
        required_error: "Please select your Pilates experience duration",
      });
    } else {
      schemaFields.pilatesDuration = z.enum(PILATES_DURATION).optional();
    }
    if (isRequired("customApparatus")) {
      schemaFields.customApparatus = z.array(z.string()).min(1, "Please select at least one custom apparatus");
    } else {
      schemaFields.customApparatus = z.array(z.string()).optional();
    }

    return z.object(schemaFields).refine(
      (data) => {
        return data.pilatesExperience ? data.pilatesDuration !== undefined : true;
      },
      {
        message: "Please select your Pilates experience duration",
        path: ["pilatesDuration"],
      }
    );
  };

  const pilatesSchema = createSchema();
  type PilatesFormData = z.infer<typeof pilatesSchema>;

  const { handleSubmit, formState: { errors }, control, watch, setValue } = useForm<PilatesFormData>({
    resolver: zodResolver(pilatesSchema),
    mode: "onChange",
    defaultValues: {
      pilatesExperience: undefined,
      pilatesDuration: undefined,
      studioFrequency: undefined,
      sessionPreference: undefined,
      apparatusPreference: [],
      customApparatus: [],
    }
  });

  const pilatesExperience = watch("pilatesExperience");

  const handleApparatusChange = (apparatus: string) => {
    const currentApparatus = watch("apparatusPreference") || [];
    const newApparatus = currentApparatus.includes(apparatus)
      ? currentApparatus.filter((a: string) => a !== apparatus)
      : [...currentApparatus, apparatus];
    setValue("apparatusPreference", newApparatus);
  };

  const handleCustomApparatusChange = (apparatus: string) => {
    const currentApparatus = watch("customApparatus") || [];
    const newApparatus = currentApparatus.includes(apparatus)
      ? currentApparatus.filter((a: string) => a !== apparatus)
      : [...currentApparatus, apparatus];
    setValue("customApparatus", newApparatus);
  };

  const onSubmit = async (data: PilatesFormData) => {
    // Ensure all required fields are present with proper types
    const submitData = {
      pilatesExperience: data.pilatesExperience ?? null,
      studioFrequency: data.studioFrequency ?? null,
      sessionPreference: data.sessionPreference ?? null,
      apparatusPreference: data.apparatusPreference || [],
      customApparatus: data.customApparatus || [],
      pilatesDuration: data.pilatesDuration,
    };

    postPilatesExperience(submitData);
  };

  const handleNext = async () => {
    handleSubmit(onSubmit)();
  };

  // If no missing fields for pilates, show a message
  if (missingFields && missingFields.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pilates Experience</h3>
          <p className="text-sm text-gray-500">Your Pilates experience information is already complete!</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            All required Pilates experience information has been provided. You can proceed to the next step.
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
        <p className="text-sm text-gray-500">
          {missingFields && missingFields.length > 0
            ? `Please complete the following information: ${missingFields.join(', ')}`
            : "Tell us about your Pilates experience and preferences"
          }
        </p>
      </div>

      <div className="space-y-4">
        {(!missingFields || missingFields.includes('pilatesExperience')) && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Have you practiced Pilates before?
            </label>
            {errors.pilatesExperience && (
              <p className="mt-1 text-sm text-red-600">{errors.pilatesExperience.message?.toString()}</p>
            )}
            <Controller
              name="pilatesExperience"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={field.value !== undefined ? field.value.toString() : undefined}
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

        {(!missingFields || missingFields.includes('pilatesDuration')) && (
          <div>
            <label htmlFor="pilates-duration" className="block text-sm font-medium text-gray-700">
              How long have you been practicing Pilates?
            </label>
            {errors.pilatesDuration && (
              <p className="mt-1 text-sm text-red-600">{errors.pilatesDuration.message?.toString()}</p>
            )}
            <Controller
              name="pilatesDuration"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
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

        {(!missingFields || missingFields.includes('studioFrequency')) && (
          <div>
            <label htmlFor="studio-frequency" className="mb-2 block text-sm font-medium text-gray-700">
              How often can you attend in-studio Pilates sessions?
            </label>
            {errors.studioFrequency && (
              <p className="mt-1 text-sm text-red-600">{errors.studioFrequency.message?.toString()}</p>
            )}
            <Controller
              name="studioFrequency"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
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

        {(!missingFields || missingFields.includes('sessionPreference')) && (
          <div>
            <label htmlFor="session-preference" className="mb-2 block text-sm font-medium text-gray-700">
              Do you prefer group classes or private sessions?
            </label>
            {errors.sessionPreference && (
              <p className="mt-1 text-sm text-red-600">{errors.sessionPreference.message?.toString()}</p>
            )}
            <Controller
              name="sessionPreference"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
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
        )}

        {(!missingFields || missingFields.includes('apparatusPreference')) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Are there specific Pilates apparatus you enjoy using or want to learn?
            </label>
            {errors.apparatusPreference && (
              <p className="mb-2 text-sm text-red-600">{errors.apparatusPreference.message?.toString()}</p>
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
        {(!missingFields || missingFields.includes('customApparatus')) &&
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Do you use any of the following at home?
            </label>
            {errors.customApparatus && (
              <p className="mb-2 text-sm text-red-600">{errors.customApparatus?.message?.toString()}</p>
            )}
            <Controller
              name="customApparatus"
              control={control}
              render={({ field }) => (
                <MultiSelectPills
                  options={CUSTOM_PILATES_APPARATUS}
                  selectedValues={field.value || []}
                  onChange={handleCustomApparatusChange}
                />
              )}
            />
          </div>}
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