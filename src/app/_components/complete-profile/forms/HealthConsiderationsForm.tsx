import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { HEALTH_CONDITIONS, PREGNANCY_OPTIONS } from "@/app/_constants/health";
import { Button } from "@/components/ui/button";
import type { MissingFieldsGrouped } from "../../dashboard/MultiStepGeneratePlanDialog";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Define proper types for the form data
type PregnancyOption = typeof PREGNANCY_OPTIONS[number];

interface HealthConsiderationsSubmitData {
  injuries: boolean | null;
  injuriesDetails: string | null;
  recentSurgery: boolean | null;
  surgeryDetails: string | null;
  chronicConditions: string[];
  otherHealthConditions: string[] | null;
  pregnancy: PregnancyOption | null;
  pregnancyConsultedDoctor: boolean | null;
  pregnancyConsultedDoctorDetails: string | null;
}

export default function HealthConsiderationsForm({
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
  console.log(missingFields);
  const utils = api.useUtils();
  const { mutate: postHealthConsiderations } = api.onboarding.postHealthConsiderations.useMutation({
    onSuccess: () => {
      toast.success("Health considerations saved successfully");
      utils.onboarding.getOnboardingData.invalidate();
      onNext();
    },
    onError: () => {
      toast.error("Failed to save health considerations");
    }
  });

  // Get health missing fields - much simpler!
  const healthMissingFields = missingFields?.health || [];
  const hasMissingFields = healthMissingFields.length > 0;

  // Create dynamic schema based on missingFields
  const createSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    // Helper function to check if field is required
    const isRequired = (fieldName: string) => {
      return hasMissingFields && healthMissingFields.includes(fieldName);
    };

    // Injuries field
    if (isRequired('injuries')) {
      schemaFields.injuries = z.boolean({
        required_error: "Please select whether you have injuries",
      });
    } else {
      schemaFields.injuries = z.boolean().optional();
    }

    // Injuries details field (optional)
    schemaFields.injuriesDetails = z.string().optional();

    // Recent surgery field
    if (isRequired('recentSurgery')) {
      schemaFields.recentSurgery = z.boolean({
        required_error: "Please select whether you have had recent surgery",
      });
    } else {
      schemaFields.recentSurgery = z.boolean().optional();
    }

    // Surgery details field (optional)
    schemaFields.surgeryDetails = z.string().optional();

    // Chronic conditions field
    if (isRequired('chronicConditions')) {
      schemaFields.chronicConditions = z.array(z.string()).min(1, "Please select at least one condition or 'None'");
    } else {
      schemaFields.chronicConditions = z.array(z.string()).optional();
    }

    // Other health conditions field (optional)
    schemaFields.otherHealthConditions = z.array(z.string()).optional();

    // Pregnancy field
    if (isRequired('pregnancy')) {
      schemaFields.pregnancy = z.enum(PREGNANCY_OPTIONS, {
        required_error: "Please select your pregnancy status",
      });
    } else {
      schemaFields.pregnancy = z.enum(PREGNANCY_OPTIONS).optional();
    }

    // Pregnancy consulted doctor field (optional)
    schemaFields.pregnancyConsultedDoctor = z.boolean().optional();

    // Pregnancy consulted doctor details field (optional)
    schemaFields.pregnancyConsultedDoctorDetails = z.string().optional();

    return z.object(schemaFields);
  };

  const healthConsiderationsSchema = createSchema();
  type HealthConsiderationsFormData = z.infer<typeof healthConsiderationsSchema>;

  const { handleSubmit, formState: { errors }, control, watch, setValue } = useForm<HealthConsiderationsFormData>({
    resolver: zodResolver(healthConsiderationsSchema),
    mode: "onChange",
    defaultValues: {
      injuries: undefined,
      injuriesDetails: undefined,
      recentSurgery: undefined,
      surgeryDetails: undefined,
      chronicConditions: [],
      otherHealthConditions: [],
      pregnancy: undefined,
      pregnancyConsultedDoctor: undefined,
      pregnancyConsultedDoctorDetails: undefined,
    }
  });

  const handleConditionChange = (condition: string) => {
    const currentConditions = watch("chronicConditions") || [];
    if (Array.isArray(currentConditions)) {
      const newConditions = currentConditions.includes(condition)
        ? currentConditions.filter((c: string) => c !== condition)
        : [...currentConditions, condition];
      setValue("chronicConditions", newConditions);
    }
  };

  const handleOtherConditionChange = (condition: string) => {
    const currentConditions = watch("otherHealthConditions") || [];
    if (Array.isArray(currentConditions)) {
      const newConditions = currentConditions.includes(condition)
        ? currentConditions.filter((c: string) => c !== condition)
        : [...currentConditions, condition];
      setValue("otherHealthConditions", newConditions);
    }
  };

  const onSubmit = async (data: HealthConsiderationsFormData) => {
    // Build submit data with proper types, only including fields that have values
    const submitData: Partial<HealthConsiderationsSubmitData> = {};

    if (data.injuries !== undefined) {
      submitData.injuries = data.injuries;
      if (data.injuries && data.injuriesDetails) {
        const trimmedDetails = typeof data.injuriesDetails === 'string' ? data.injuriesDetails.trim() : '';
        if (trimmedDetails) {
          submitData.injuriesDetails = trimmedDetails;
        }
      }
    }

    if (data.recentSurgery !== undefined) {
      submitData.recentSurgery = data.recentSurgery;
      if (data.recentSurgery && data.surgeryDetails) {
        const trimmedDetails = typeof data.surgeryDetails === 'string' ? data.surgeryDetails.trim() : '';
        if (trimmedDetails) {
          submitData.surgeryDetails = trimmedDetails;
        }
      }
    }

    if (data.chronicConditions && Array.isArray(data.chronicConditions) && data.chronicConditions.length > 0) {
      submitData.chronicConditions = data.chronicConditions as string[];
      // Handle "Other" conditions
      if (data.chronicConditions.includes("Other") && data.otherHealthConditions && Array.isArray(data.otherHealthConditions) && data.otherHealthConditions.length > 0) {
        submitData.otherHealthConditions = data.otherHealthConditions as string[];
      }
    }

    if (data.pregnancy !== undefined) {
      submitData.pregnancy = data.pregnancy as PregnancyOption;
    }

    if (data.pregnancyConsultedDoctor !== undefined) {
      submitData.pregnancyConsultedDoctor = data.pregnancyConsultedDoctor;
      if (data.pregnancyConsultedDoctor && data.pregnancyConsultedDoctorDetails) {
        const trimmedDetails = typeof data.pregnancyConsultedDoctorDetails === 'string' ? data.pregnancyConsultedDoctorDetails.trim() : '';
        if (trimmedDetails) {
          submitData.pregnancyConsultedDoctorDetails = trimmedDetails;
        }
      }
    }

    // Only submit if there's actual data
    if (Object.keys(submitData).length > 0) {
      // Ensure all required fields are present for the API
      const apiData: HealthConsiderationsSubmitData = {
        injuries: submitData.injuries ?? null,
        injuriesDetails: submitData.injuriesDetails ?? null,
        recentSurgery: submitData.recentSurgery ?? null,
        surgeryDetails: submitData.surgeryDetails ?? null,
        chronicConditions: submitData.chronicConditions || [],
        otherHealthConditions: submitData.otherHealthConditions ?? null,
        pregnancy: submitData.pregnancy ?? null,
        pregnancyConsultedDoctor: submitData.pregnancyConsultedDoctor ?? null,
        pregnancyConsultedDoctorDetails: submitData.pregnancyConsultedDoctorDetails ?? null,
      };
      postHealthConsiderations(apiData);
    } else {
      // If no data to submit, just proceed to next step
      onNext();
    }
  };

  const handleNext = async () => {
    handleSubmit(onSubmit)();
  };

  // If no missing fields for health, show a message
  if (!hasMissingFields) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Health Considerations</h3>
          <p className="text-sm text-gray-500">Your health considerations information is already complete!</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            All required health considerations information has been provided. You can proceed to the next step.
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
        <h3 className="text-lg font-semibold text-gray-900">Health Considerations</h3>
        <p className="text-sm text-gray-500">Tell us about any health considerations that may affect your fitness journey</p>
      </div>

      <div className="space-y-4">
        {healthMissingFields.includes('injuries') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Do you have any past or present injuries?
            </label>
            {errors.injuries && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.injuries?.message === 'string' ? errors.injuries.message : 'Invalid input'}</p>
            )}
            <Controller
              name="injuries"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={field.value !== null && field.value !== undefined ? String(field.value) : ""}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="injuries-yes" />
                    <label htmlFor="injuries-yes" className="text-sm font-medium text-gray-700">Yes</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="injuries-no" />
                    <label htmlFor="injuries-no" className="text-sm font-medium text-gray-700">No</label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        )}

        {watch("injuries") && (
          <div>
            <label htmlFor="injuries-details" className="block text-sm font-medium text-gray-700 mb-2">
              Please describe your injuries
            </label>
            {errors.injuriesDetails && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.injuriesDetails?.message === 'string' ? errors.injuriesDetails.message : 'Invalid input'}</p>
            )}
            <Controller
              name="injuriesDetails"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="injuries-details"
                  placeholder="Describe your injuries and any limitations..."
                  className="min-h-[100px]"
                />
              )}
            />
          </div>
        )}

        {healthMissingFields.includes('recentSurgery') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Have you had any recent or past surgery?
            </label>
            {errors.recentSurgery && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.recentSurgery?.message === 'string' ? errors.recentSurgery.message : 'Invalid input'}</p>
            )}
            <Controller
              name="recentSurgery"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={field.value !== null && field.value !== undefined ? String(field.value) : ""}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="surgery-yes" />
                    <label htmlFor="surgery-yes" className="text-sm font-medium text-gray-700">Yes</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="surgery-no" />
                    <label htmlFor="surgery-no" className="text-sm font-medium text-gray-700">No</label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        )}

        {watch("recentSurgery") && (
          <div>
            <label htmlFor="surgery-details" className="block text-sm font-medium text-gray-700 mb-2">
              Please describe your recent surgery
            </label>
            {errors.surgeryDetails && (
              <p className="mt-1 text-sm text-red-600">{typeof errors.surgeryDetails?.message === 'string' ? errors.surgeryDetails.message : 'Invalid input'}</p>
            )}
            <Controller
              name="surgeryDetails"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="surgery-details"
                  placeholder="Describe your recent surgery..."
                  className="w-full"
                  rows={3}
                />
              )}
            />
          </div>
        )}

        {healthMissingFields.includes('chronicConditions') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Do you have any chronic health conditions?
            </label>
            {errors.chronicConditions && (
              <p className="mb-2 text-sm text-red-600">{typeof errors.chronicConditions?.message === 'string' ? errors.chronicConditions.message : 'Invalid input'}</p>
            )}
            <Controller
              name="chronicConditions"
              control={control}
              render={({ field }) => (
                <MultiSelectPills
                  options={HEALTH_CONDITIONS}
                  selectedValues={field.value || []}
                  onChange={handleConditionChange}
                />
              )}
            />
          </div>
        )}
        {(() => {
          const conditions = watch("chronicConditions");
          return Array.isArray(conditions) && conditions.includes("Other") ? (
            <div className="mt-2">
              <Input
                placeholder="Add custom condition"
                value={(() => {
                  const otherConditions = watch("otherHealthConditions");
                  return Array.isArray(otherConditions) && otherConditions.length > 0 ? otherConditions[0] : "";
                })()}
                onChange={(e) => setValue("otherHealthConditions", [e.target.value])}
              />
            </div>
          ) : null;
        })()}
        {healthMissingFields.includes('pregnancy') && (
          <div>
            <label htmlFor="pregnancy" className="mb-2 block text-sm font-medium text-gray-700">
              Are you currently pregnant?
            </label>
            {errors.pregnancy && (
              <p className="mt-1 text-sm text-red-600">{typeof errors.pregnancy?.message === 'string' ? errors.pregnancy.message : 'Invalid input'}</p>
            )}
            <Controller
              name="pregnancy"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value: PregnancyOption) => field.onChange(value)}
                  value={field.value || ""}
                  defaultValue={field.value || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select pregnancy status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREGNANCY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {watch("pregnancy") && watch("pregnancy") !== "Not applicable" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Have you consulted with your doctor about exercise during pregnancy?
            </label>
            <Controller
              name="pregnancyConsultedDoctor"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={field.value !== null && field.value !== undefined ? String(field.value) : ""}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="consulted-yes" />
                    <label htmlFor="consulted-yes" className="text-sm">Yes</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="consulted-no" />
                    <label htmlFor="consulted-no" className="text-sm">No</label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        )}

        {watch("pregnancyConsultedDoctor") && (
          <div>
            <label htmlFor="consulted-details" className="block text-sm font-medium text-gray-700 mb-2">
              What did your doctor recommend?
            </label>
            <Controller
              name="pregnancyConsultedDoctorDetails"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="consulted-details"
                  placeholder="What did your doctor recommend..."
                  className="w-full"
                  rows={3}
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