import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { HEALTH_CONDITIONS, PREGNANCY_OPTIONS } from "@/app/_constants/health";
import { Button } from "@/components/ui/button";
import type { HealthConsiderationsField } from "../../dashboard/MultiStepGeneratePlanDialog";
import { DialogFooter } from "@/components/ui/dialog";

export default function HealthConsiderationsForm({
  missingFields,
  isSubmitting,
  onNext,
  onPrevious
}: {
  missingFields?: HealthConsiderationsField[];
  isSubmitting?: boolean;
  onNext: () => void;
  onPrevious: () => void;
}) {
  console.log(missingFields);
  const utils = api.useUtils();
  const [customCondition, setCustomCondition] = useState("");
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

  // Create dynamic schema based on missingFields
  const createSchema = () => {
    const schemaFields: Record<string, any> = {};

    // Helper function to check if field is required
    const isRequired = (fieldName: string) => {
      return !missingFields || missingFields.includes(fieldName as HealthConsiderationsField);
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

    // Optional fields
    schemaFields.injuriesDetails = z.string().optional();
    schemaFields.surgeryDetails = z.string().optional();
    schemaFields.otherHealthConditions = z.array(z.string()).optional();
    schemaFields.pregnancyConsultedDoctor = z.boolean().optional();
    schemaFields.pregnancyConsultedDoctorDetails = z.string().optional();

    return z.object(schemaFields)
      .refine(
        (data) => {
          // If injuries is true, injuriesDetails should not be empty
          return !data.injuries || (data.injuries && data.injuriesDetails && data.injuriesDetails.trim() !== "");
        },
        {
          message: "Please describe your injuries or limitations",
          path: ["injuriesDetails"],
        }
      )
      .refine(
        (data) => {
          // If recentSurgery is true, surgeryDetails should not be empty
          return !data.recentSurgery || (data.recentSurgery && data.surgeryDetails && data.surgeryDetails.trim() !== "");
        },
        {
          message: "Please provide details about your surgery and recovery timeline",
          path: ["surgeryDetails"],
        }
      )
      .refine(
        (data) => {
          // If "Other" is selected, at least one custom condition must be added
          return !data.chronicConditions?.includes("Other") || (data.otherHealthConditions && data.otherHealthConditions.length > 0);
        },
        {
          message: "Please add at least one custom health condition",
          path: ["otherHealthConditions"],
        }
      )
      .refine(
        (data) => {
          // If pregnancyConsultedDoctor is true, details are required
          if (data.pregnancyConsultedDoctor === true) {
            return data.pregnancyConsultedDoctorDetails && data.pregnancyConsultedDoctorDetails.trim() !== "";
          }
          return true;
        },
        {
          message: "Please provide more information about your doctor's consultation",
          path: ["pregnancyConsultedDoctorDetails"],
        }
      );
  };

  const healthConsiderationsSchema = createSchema();
  type HealthConsiderationsFormData = z.infer<typeof healthConsiderationsSchema>;

  // Determine default value for injuries based on missing fields
  const getInjuriesDefaultValue = () => {
    if (!missingFields) return undefined;

    const hasInjuries = missingFields.includes('injuries');
    const hasInjuriesDetails = missingFields.includes('injuriesDetails');

    if (hasInjuries && hasInjuriesDetails) {
      return undefined;
    } else if (hasInjuries && !hasInjuriesDetails) {
      return false;
    } else {
      return true;
    }
  };

  // Determine default value for recentSurgery based on missing fields
  const getRecentSurgeryDefaultValue = () => {
    if (!missingFields) return undefined;

    const hasRecentSurgery = missingFields.includes('recentSurgery');
    const hasSurgeryDetails = missingFields.includes('surgeryDetails');

    if (hasRecentSurgery && hasSurgeryDetails) {
      return undefined;
    } else if (hasRecentSurgery && !hasSurgeryDetails) {
      return false;
    } else {
      return true;
    }
  };

  const { handleSubmit, formState: { errors }, control, watch, setValue, setError, clearErrors, trigger } = useForm<HealthConsiderationsFormData>({
    resolver: zodResolver(healthConsiderationsSchema),
    mode: "onChange",
    defaultValues: {
      injuries: getInjuriesDefaultValue(),
      injuriesDetails: "",
      recentSurgery: getRecentSurgeryDefaultValue(),
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

  // Add this to trigger validation when injuries changes
  const handleInjuriesChange = (value: boolean) => {
    setValue("injuries", value, { shouldValidate: true });

    // If switching to true, validate injuriesDetails field immediately
    if (value && watch("injuriesDetails")?.trim() === "") {
      setError("injuriesDetails", {
        type: "custom",
        message: "Please describe your injuries or limitations"
      });
    } else if (!value) {
      // If switching to false, clear any errors on injuriesDetails
      clearErrors("injuriesDetails");
    }
  };

  // Add this to trigger validation when recentSurgery changes
  const handleRecentSurgeryChange = (value: boolean) => {
    setValue("recentSurgery", value, { shouldValidate: true });

    // If switching to true, validate surgeryDetails field immediately
    if (value && watch("surgeryDetails")?.trim() === "") {
      setError("surgeryDetails", {
        type: "custom",
        message: "Please provide details about your surgery and recovery timeline"
      });
    } else if (!value) {
      // If switching to false, clear any errors on surgeryDetails
      clearErrors("surgeryDetails");
    }
  };

  const handleChronicConditionsChange = (condition: string) => {
    const currentConditions = watch("chronicConditions") || [];
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter((c: string) => c !== condition)
      : [...currentConditions, condition];
    setValue("chronicConditions", newConditions);
  };

  const handleAddOtherHealthCondition = () => {
    if (customCondition.trim()) {
      const currentOtherConditions = watch("otherHealthConditions") || [];
      setValue("otherHealthConditions", [...currentOtherConditions, customCondition]);
      setCustomCondition("");
    }
  };

  const removeOtherHealthCondition = (condition: string) => {
    const currentOtherConditions = watch("otherHealthConditions") || [];
    setValue("otherHealthConditions", currentOtherConditions.filter((c: string) => c !== condition));
  };

  const onSubmit = async (data: HealthConsiderationsFormData) => {
    postHealthConsiderations(data);
  };

  const handleNext = async () => {
    handleSubmit(onSubmit)();
  };

  // If no missing fields for health considerations, show a message
  if (missingFields && missingFields.length === 0) {
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
        <p className="text-sm text-gray-500">
          {missingFields && missingFields.length > 0
            ? `Please complete the following information: ${missingFields.join(', ')}`
            : "Tell us about any health considerations that may affect your fitness journey"
          }
        </p>
      </div>

      <div className="space-y-4">
        {(!missingFields || (missingFields.includes('injuries')) || missingFields.includes("injuriesDetails")) && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Do you have any injuries or physical limitations?
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

        {hasInjuries && (!missingFields || missingFields.includes('injuriesDetails')) && (
          <div>
            <label htmlFor="injuries-details" className="block text-sm font-medium text-gray-700">
              Please describe your injuries or limitations:
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
                  rows={3}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 text-sm ${errors.injuriesDetails
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-indigo-500"
                    }`}
                  placeholder="Please provide details about your injuries or limitations..."
                  onBlur={() => {
                    if (hasInjuries && (field.value?.trim() === "")) {
                      setError("injuriesDetails", {
                        type: "custom",
                        message: "Please describe your injuries or limitations"
                      });
                    } else {
                      void trigger("injuriesDetails");
                    }
                  }}
                />
              )}
            />
          </div>
        )}

        {(!missingFields || (missingFields.includes('recentSurgery')) || missingFields.includes("surgeryDetails")) && (
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

        {hasRecentSurgery && (!missingFields || missingFields.includes('surgeryDetails')) && (
          <div>
            <label htmlFor="surgery-details" className="block text-sm font-medium text-gray-700">
              Please provide details about your surgery and recovery timeline:
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
                  rows={3}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 text-sm ${errors.surgeryDetails
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-indigo-500"
                    }`}
                  placeholder="Please provide details about your surgery and recovery timeline..."
                  onBlur={() => {
                    if (hasRecentSurgery && (field.value?.trim() === "")) {
                      setError("surgeryDetails", {
                        type: "custom",
                        message: "Please provide details about your surgery and recovery timeline"
                      });
                    } else {
                      void trigger("surgeryDetails");
                    }
                  }}
                />
              )}
            />
          </div>
        )}

        {(!missingFields || missingFields.includes('chronicConditions')) && (
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
                  onChange={handleChronicConditionsChange}
                />
              )}
            />
            {watch("chronicConditions")?.includes("Other") && (
              <>
                <div className="mt-4 flex gap-2">
                  <Input
                    type="text"
                    value={customCondition}
                    onChange={(e) => setCustomCondition(e.target.value)}
                    placeholder="Add custom condition"
                    className={`flex-1 rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm ${errors.otherHealthConditions ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-indigo-500"
                      }`}
                  />
                  <Button
                    type="button"
                    onClick={handleAddOtherHealthCondition}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {errors.otherHealthConditions && (
                  <p className="mt-2 text-sm text-red-600">{errors.otherHealthConditions.message?.toString()}</p>
                )}
                <div className="mt-3 space-y-2">
                  {watch("otherHealthConditions")?.map((condition: string) => (
                    <div key={condition} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <span className="text-sm text-gray-700">{condition}</span>
                      <button
                        type="button"
                        onClick={() => removeOtherHealthCondition(condition)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {(!missingFields || missingFields.includes('pregnancy')) && (
          <div>
            <label htmlFor="pregnancy" className="mb-2 block text-sm font-medium text-gray-700">
              Are you pregnant or postpartum?
            </label>
            {errors.pregnancy && (
              <p className="mt-1 text-sm text-red-600">{errors.pregnancy.message?.toString()}</p>
            )}
            <Controller
              name="pregnancy"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset doctor fields if "Not applicable" is selected
                    if (value === "Not applicable") {
                      setValue("pregnancyConsultedDoctor", false);
                      setValue("pregnancyConsultedDoctorDetails", "");
                    }
                  }}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
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
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Have you consulted a doctor about your pregnancy or postpartum status?
            </label>
            {errors.pregnancyConsultedDoctor && (
              <p className="mt-1 text-sm text-red-600">{errors.pregnancyConsultedDoctor.message?.toString()}</p>
            )}
            <Controller
              name="pregnancyConsultedDoctor"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={val => field.onChange(val === "true")}
                  value={field.value === undefined ? undefined : String(field.value)}
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

        {hasPregnancy && hasConsultedDoctor && (
          <div className="mt-4">
            <label htmlFor="pregnancy-consulted-details" className="block text-sm font-medium text-gray-700">
              Please provide more information about your doctor&apos;s consultation:
            </label>
            {errors.pregnancyConsultedDoctorDetails && (
              <p className="mt-1 text-sm text-red-600">{errors.pregnancyConsultedDoctorDetails.message?.toString()}</p>
            )}
            <Controller
              name="pregnancyConsultedDoctorDetails"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="pregnancy-consulted-details"
                  rows={3}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm ${errors.pregnancyConsultedDoctorDetails
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-indigo-500"
                    }`}
                  placeholder="Please provide details about your doctor's consultation..."
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