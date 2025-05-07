import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import FormFooter from "./FormFooter";
import type { STEPS } from "@/app/onboarding/[tab]/page";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import Input from "../global/Input";
import { Textarea } from "@/components/ui/textarea";
import FormLayout from "./FormLayout";

interface HealthConsFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

const formSchema = z.object({
    injuries: z.boolean({
        required_error: "Please indicate if you have any injuries",
    }),
    injuriesDetails: z.string().optional(),
    recentSurgery: z.boolean({
        required_error: "Please indicate if you've had recent surgery",
    }),
    surgeryDetails: z.string().optional(),
    chronicConditions: z.array(z.string()).min(1, "Please select at least one option"),
    otherHealthConditions: z.array(z.string()).optional(),
    pregnancy: z.enum(["Not applicable", "Pregnant", "Postpartum (0-6 months)", "Postpartum (6-12 months)"], {
        required_error: "Please select your pregnancy status",
    }),
})
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
    );

export default function HealthConsForm({ isFirstStep, isLastStep, currentStep }: HealthConsFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customCondition, setCustomCondition] = useState("");
    const { register, handleSubmit, formState: { errors }, control, watch, setValue, setError, clearErrors, trigger } = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            injuries: undefined,
            injuriesDetails: "",
            recentSurgery: undefined,
            surgeryDetails: "",
            chronicConditions: [],
            otherHealthConditions: [],
            pregnancy: undefined,
        }
    });

    const hasInjuries = watch("injuries");
    const hasRecentSurgery = watch("recentSurgery");

    // Add this to trigger validation when injuries changes
    const handleInjuriesChange = (value: boolean) => {
        setValue("injuries", value, { shouldValidate: true });

        // If switching to Yes, validate injuriesDetails field immediately
        if (value && watch("injuriesDetails")?.trim() === "") {
            setError("injuriesDetails", {
                type: "custom",
                message: "Please describe your injuries or limitations"
            });
        } else if (!value) {
            // If switching to No, clear any errors on injuriesDetails
            clearErrors("injuriesDetails");
        }
    };

    // Add this to trigger validation when recentSurgery changes
    const handleRecentSurgeryChange = (value: boolean) => {
        setValue("recentSurgery", value, { shouldValidate: true });

        // If switching to Yes, validate surgeryDetails field immediately
        if (value && watch("surgeryDetails")?.trim() === "") {
            setError("surgeryDetails", {
                type: "custom",
                message: "Please provide details about your surgery and recovery timeline"
            });
        } else if (!value) {
            // If switching to No, clear any errors on surgeryDetails
            clearErrors("surgeryDetails");
        }
    };

    const handleChronicConditionsChange = (condition: string) => {
        const currentConditions = watch("chronicConditions");
        const newConditions = currentConditions.includes(condition)
            ? currentConditions.filter(c => c !== condition)
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
        setValue("otherHealthConditions", currentOtherConditions.filter(c => c !== condition));
    };

    const onSubmit = async (): Promise<boolean> => {
        // Additional validation before submission
        if (hasInjuries && !watch("injuriesDetails")?.trim()) {
            setError("injuriesDetails", {
                type: "custom",
                message: "Please describe your injuries or limitations"
            });
            return false;
        }

        if (hasRecentSurgery && !watch("surgeryDetails")?.trim()) {
            setError("surgeryDetails", {
                type: "custom",
                message: "Please provide details about your surgery and recovery timeline"
            });
            return false;
        }

        let isValid = false;
        await handleSubmit(async (data) => {
            setIsSubmitting(true);
            try {
                // Your submit logic here (e.g., API call)
                console.log("Health considerations data submitted:", data);
                isValid = true;
            } catch (error) {
                console.error("Form validation failed:", error);
                isValid = false;
            } finally {
                setIsSubmitting(false);
            }
        })();
        return isValid;
    };

    return (
        <FormLayout
            onSubmit={onSubmit}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            currentStep={currentStep}
            isSubmitting={isSubmitting}
        >
            <form className="space-y-8 max-w-md mx-auto px-2">
                <h2 className="text-2xl font-bold text-gray-900">Health Considerations</h2>
                <div className="space-y-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Do you have any injuries or physical limitations?
                        </label>
                        {errors.injuries && (
                            <p className="mt-1 text-sm text-red-600">{errors.injuries.message}</p>
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

                    {hasInjuries && (
                        <div>
                            <label htmlFor="injuries-details" className="block text-sm font-medium text-gray-700">
                                Please describe your injuries or limitations:
                            </label>
                            {errors.injuriesDetails && (
                                <p className="mt-1 text-sm text-red-600">{errors.injuriesDetails.message}</p>
                            )}
                            <Controller
                                name="injuriesDetails"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        id="injuries-details"
                                        rows={3}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm ${errors.injuriesDetails
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
                                                trigger("injuriesDetails");
                                            }
                                        }}
                                    />
                                )}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Are you recovering from any recent surgeries?
                        </label>
                        {errors.recentSurgery && (
                            <p className="mt-1 text-sm text-red-600">{errors.recentSurgery.message}</p>
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

                    {hasRecentSurgery && (
                        <div>
                            <label htmlFor="surgery-details" className="block text-sm font-medium text-gray-700">
                                Please provide details about your surgery and recovery timeline:
                            </label>
                            {errors.surgeryDetails && (
                                <p className="mt-1 text-sm text-red-600">{errors.surgeryDetails.message}</p>
                            )}
                            <Controller
                                name="surgeryDetails"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        id="surgery-details"
                                        rows={3}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm ${errors.surgeryDetails
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
                                                trigger("surgeryDetails");
                                            }
                                        }}
                                    />
                                )}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-4">
                            Do you have any chronic health conditions?
                        </label>
                        {errors.chronicConditions && (
                            <p className="mb-2 text-sm text-red-600">{errors.chronicConditions.message}</p>
                        )}
                        <Controller
                            name="chronicConditions"
                            control={control}
                            render={({ field }) => (
                                <MultiSelectPills
                                    options={["Back pain", "Neck pain", "Arthritis", "Osteoporosis", "Hypertension", "Diabetes", "Heart condition", "Respiratory condition", "None", "Other"]}
                                    selectedValues={field.value}
                                    onChange={handleChronicConditionsChange}
                                />
                            )}
                        />
                        {watch("chronicConditions").includes("Other") && (
                            <>
                                <div className="mt-4 flex gap-2">
                                    <Input
                                        type="text"
                                        value={customCondition}
                                        onChange={(e) => setCustomCondition(e.target.value)}
                                        placeholder="Add custom condition"
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddOtherHealthCondition}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="mt-3 space-y-2">
                                    {watch("otherHealthConditions")?.map((condition) => (
                                        <div key={condition} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                            <span className="text-sm text-gray-700">{condition}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeOtherHealthCondition(condition)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <label htmlFor="pregnancy" className="block text-sm font-medium text-gray-700">
                            Are you pregnant or postpartum?
                        </label>
                        {errors.pregnancy && (
                            <p className="mt-1 text-sm text-red-600">{errors.pregnancy.message}</p>
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
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Not applicable">Not applicable</SelectItem>
                                        <SelectItem value="Pregnant">Pregnant</SelectItem>
                                        <SelectItem value="Postpartum (0-6 months)">Postpartum (0-6 months)</SelectItem>
                                        <SelectItem value="Postpartum (6-12 months)">Postpartum (6-12 months)</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </div>
            </form>
        </FormLayout>
    );
}