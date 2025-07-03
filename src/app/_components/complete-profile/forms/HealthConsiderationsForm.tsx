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

  // Create base schema based on missingFields (without conditional dependencies)
  const createBaseSchema = () => {
    const schemaFields: Record<string, any> = {};

    // Helper function to check if field is required
    const isRequired = (fieldName: string) => {
      return hasMissingFields && healthMissingFields.includes(fieldName);
    };

    // Injuries field
    if (isRequired('injuries')) {
      schemaFields.injuries = z.boolean({
        required_error: "Please indicate if you have any injuries",
      });
    } else {
      schemaFields.injuries = z.boolean().optional();
    }

    // Recent surgery field
    if (isRequired('recentSurgery')) {
      schemaFields.recentSurgery = z.boolean({
        required_error: "Please indicate if you've had recent surgery",
      });
    } else {
      schemaFields.recentSurgery = z.boolean().optional();
    }

    // Chronic conditions field
    if (isRequired('chronicConditions')) {
      schemaFields.chronicConditions = z.array(z.string()).min(1, "Please select at least one option");
    } else {
      schemaFields.chronicConditions = z.array(z.string()).optional();
    }

    // Pregnancy field
    if (isRequired('pregnancy')) {
      schemaFields.pregnancy = z.enum(PREGNANCY_OPTIONS, {
        required_error: "Please select your pregnancy status",
      });
    } else {
      schemaFields.pregnancy = z.enum(PREGNANCY_OPTIONS).optional();
    }

    // Optional fields (always optional)
    schemaFields.injuriesDetails = z.string().optional();
    schemaFields.surgeryDetails = z.string().optional();
    schemaFields.otherHealthConditions = z.array(z.string()).optional();
    schemaFields.pregnancyConsultedDoctor = z.boolean().optional();
    schemaFields.pregnancyConsultedDoctorDetails = z.string().optional();

    return z.object(schemaFields);
  };

  const healthConsiderationsSchema = createBaseSchema();
  type HealthConsiderationsFormData = z.infer<typeof healthConsiderationsSchema>;

  const { handleSubmit, formState: { errors }, control, watch, setValue, setError, clearErrors, trigger } = useForm<HealthConsiderationsFormData>({
    resolver: zodResolver(healthConsiderationsSchema),
    mode: "onChange",
    defaultValues: {
      injuries: undefined,
      injuriesDetails: "",
      recentSurgery: undefined,
      surgeryDetails: "",
      chronicConditions: [],
      otherHealthConditions: [],
      pregnancy: undefined,
      pregnancyConsultedDoctor: undefined,
      pregnancyConsultedDoctorDetails: "",
    }
  });

  const hasInjuries = watch("injuries");
  const hasRecentSurgery = watch("recentSurgery");
  const hasPregnancy = watch("pregnancy") && watch("pregnancy") !== "Not applicable";
  const hasConsultedDoctor = watch("pregnancyConsultedDoctor") === true;

  // Add conditional validation for details fields
  useEffect(() => {
    // Validate injuries details when injuries is true
    if (hasInjuries === true) {
      const injuriesDetails = watch("injuriesDetails");
      if (!injuriesDetails || injuriesDetails.trim() === "") {
        setError("injuriesDetails", {
          type: "manual",
          message: "Please describe your injuries or limitations"
        });
      } else {
        clearErrors("injuriesDetails");
      }
    }

    // Validate surgery details when recentSurgery is true
    if (hasRecentSurgery === true) {
      const surgeryDetails = watch("surgeryDetails");
      if (!surgeryDetails || surgeryDetails.trim() === "") {
        setError("surgeryDetails", {
          type: "manual",
          message: "Please describe your recent surgery"
        });
      } else {
        clearErrors("surgeryDetails");
      }
    }
  }, [hasInjuries, hasRecentSurgery, watch, setError, clearErrors]);

  const handleChronicConditionChange = (condition: string) => {
    const currentConditions = watch("chronicConditions") || [];
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter((c: string) => c !== condition)
      : [...currentConditions, condition];
    setValue("chronicConditions", newConditions);
  };

  const handleInjuriesChange = (value: boolean) => {
    setValue("injuries", value);
    if (value === false) {
      setValue("injuriesDetails", "");
      clearErrors("injuriesDetails");
    }
  };

  const handleRecentSurgeryChange = (value: boolean) => {
    setValue("recentSurgery", value);
    if (value === false) {
      setValue("surgeryDetails", "");
      clearErrors("surgeryDetails");
    }
  };

  const onSubmit = async (data: HealthConsiderationsFormData) => {
    // Validate required details before proceeding
    if (data.injuries === true && (!data.injuriesDetails || data.injuriesDetails.trim() === "")) {
      setError("injuriesDetails", {
        type: "manual",
        message: "Please describe your injuries or limitations"
      });
      return;
    }

    if (data.recentSurgery === true && (!data.surgeryDetails || data.surgeryDetails.trim() === "")) {
      setError("surgeryDetails", {
        type: "manual",
        message: "Please describe your recent surgery"
      });
      return;
    }

    // Build submit data object dynamically, only including fields with actual data
    const submitData: any = {};

    // Only include fields that have values
    if (data.injuries !== undefined && data.injuries !== null) {
      submitData.injuries = data.injuries;
      if (data.injuries === true && data.injuriesDetails?.trim()) {
        submitData.injuriesDetails = data.injuriesDetails.trim();
      }
    }

    if (data.recentSurgery !== undefined && data.recentSurgery !== null) {
      submitData.recentSurgery = data.recentSurgery;
      if (data.recentSurgery === true && data.surgeryDetails?.trim()) {
        submitData.surgeryDetails = data.surgeryDetails.trim();
      }
    }

    if (data.chronicConditions && data.chronicConditions.length > 0) {
      submitData.chronicConditions = data.chronicConditions;
    }

    if (data.otherHealthConditions && data.otherHealthConditions.length > 0) {
      submitData.otherHealthConditions = data.otherHealthConditions;
    }

    if (data.pregnancy !== undefined && data.pregnancy !== null) {
      submitData.pregnancy = data.pregnancy;
      if (data.pregnancy === true) {
        if (data.pregnancyConsultedDoctor !== undefined && data.pregnancyConsultedDoctor !== null) {
          submitData.pregnancyConsultedDoctor = data.pregnancyConsultedDoctor;
          if (data.pregnancyConsultedDoctor === true && data.pregnancyConsultedDoctorDetails?.trim()) {
            submitData.pregnancyConsultedDoctorDetails = data.pregnancyConsultedDoctorDetails.trim();
          }
        }
      }
    }

    // Only call API if there's actual data to submit
    if (Object.keys(submitData).length > 0) {
      postHealthConsiderations(submitData);
    } else {
      // No data to submit, proceed to next step
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
        {(healthMissingFields.includes('injuries')) && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Do you have any current injuries or physical limitations?
            </label>
            {errors.injuries && (
              <p className="mt-1 text-sm text-red-600">{errors.injuries.message?.toString()}</p>
            )}
            <Controller
              name="injuries"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => handleInjuriesChange(value === "true")}
                  value={field.value !== undefined ? field.value.toString() : undefined}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="injuries-yes" />
                    <label htmlFor="injuries-yes" className="text-sm">Yes</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="injuries-no" />
                    <label htmlFor="injuries-no" className="text-sm">No</label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        )}

        {hasInjuries === true && (
          <div>
            <label htmlFor="injuries-details" className="block text-sm font-medium text-gray-700 mb-2">
              Please describe your injuries or limitations
            </label>
            {errors.injuriesDetails && (
              <p className="mt-1 text-sm text-red-600">{errors.injuriesDetails.message?.toString()}</p>
            )}
            <Controller
              name="injuriesDetails"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="injuries-details"
                  placeholder="Describe your injuries or limitations..."
                  className="w-full"
                  rows={3}
                />
              )}
            />
          </div>
        )}

        {healthMissingFields.includes('recentSurgery') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Are you recovering from any recent surgeries?
            </label>
            {errors.recentSurgery && (
              <p className="mt-1 text-sm text-red-600">{errors.recentSurgery.message?.toString()}</p>
            )}
            <Controller
              name="recentSurgery"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => handleRecentSurgeryChange(value === "true")}
                  value={field.value !== undefined ? field.value.toString() : undefined}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="surgery-yes" />
                    <label htmlFor="surgery-yes" className="text-sm">Yes</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="surgery-no" />
                    <label htmlFor="surgery-no" className="text-sm">No</label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        )}

        {hasRecentSurgery === true && (
          <div>
            <label htmlFor="surgery-details" className="block text-sm font-medium text-gray-700 mb-2">
              Please describe your recent surgery
            </label>
            {errors.surgeryDetails && (
              <p className="mt-1 text-sm text-red-600">{errors.surgeryDetails.message?.toString()}</p>
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
              <p className="mb-2 text-sm text-red-600">{errors.chronicConditions.message?.toString()}</p>
            )}
            <Controller
              name="chronicConditions"
              control={control}
              render={({ field }) => (
                <MultiSelectPills
                  options={HEALTH_CONDITIONS}
                  selectedValues={field.value || []}
                  onChange={handleChronicConditionChange}
                />
              )}
            />
          </div>
        )}
        {watch("chronicConditions").includes("Other") && (
          <div className="mt-2">
            <Input
              placeholder="Add custom condition"
              value={watch("otherHealthConditions")[0] ?? ""}
              onChange={(e) => setValue("otherHealthConditions", [e.target.value])}
            />
          </div>
        )}
        {healthMissingFields.includes('pregnancy') && (
          <div>
            <label htmlFor="pregnancy" className="mb-2 block text-sm font-medium text-gray-700">
              Are you currently pregnant?
            </label>
            {errors.pregnancy && (
              <p className="mt-1 text-sm text-red-600">{errors.pregnancy.message?.toString()}</p>
            )}
            <Controller
              name="pregnancy"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
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

        {hasPregnancy && (
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
                  value={field.value !== undefined ? field.value.toString() : undefined}
                  className="flex space-x-4 mt-2"
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

        {hasConsultedDoctor && (
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