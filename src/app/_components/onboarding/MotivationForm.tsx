import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { STEPS } from "@/app/onboarding/constants";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import Input from "../global/Input";
import FormLayout from "./FormLayout";

interface MotivationFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

const formSchema = z.object({
    motivation: z.array(z.string()).min(1, "Please select at least one motivation factor"),
    otherMotivation: z.array(z.string()).optional(),
    progressTracking: z.array(z.string()).min(1, "Please select at least one progress tracking method"),
    otherProgressTracking: z.array(z.string()).optional(),
})
    .refine(
        (data) => {
            // If "Other" is selected in motivation, at least one custom motivation must be added
            return !data.motivation.includes("Other") || (data.otherMotivation && data.otherMotivation.length > 0);
        },
        {
            message: "Please add at least one custom motivation",
            path: ["otherMotivation"],
        }
    )
    .refine(
        (data) => {
            // If "Other" is selected in progress tracking, at least one custom method must be added
            return !data.progressTracking.includes("Other") || (data.otherProgressTracking && data.otherProgressTracking.length > 0);
        },
        {
            message: "Please add at least one custom tracking method",
            path: ["otherProgressTracking"],
        }
    );

export default function MotivationForm({ isFirstStep, isLastStep, currentStep }: MotivationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customMotivationInput, setCustomMotivationInput] = useState("");
    const [customProgressTrackingInput, setCustomProgressTrackingInput] = useState("");
    const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            motivation: [],
            otherMotivation: [],
            progressTracking: [],
            otherProgressTracking: [],
        }
    });

    const handleMotivationChange = (motivation: string) => {
        const currentMotivations = watch("motivation");
        const newMotivations = currentMotivations.includes(motivation)
            ? currentMotivations.filter(m => m !== motivation)
            : [...currentMotivations, motivation];
        setValue("motivation", newMotivations);
    };

    const handleProgressTrackingChange = (method: string) => {
        const currentMethods = watch("progressTracking");
        const newMethods = currentMethods.includes(method)
            ? currentMethods.filter(m => m !== method)
            : [...currentMethods, method];
        setValue("progressTracking", newMethods);
    };

    const handleCustomMotivation = () => {
        if (customMotivationInput.trim()) {
            const currentOtherMotivations = watch("otherMotivation") ?? [];
            setValue("otherMotivation", [...currentOtherMotivations, customMotivationInput]);
            setCustomMotivationInput("");
        }
    };

    const handleCustomProgressTracking = () => {
        if (customProgressTrackingInput.trim()) {
            const currentOtherMethods = watch("otherProgressTracking") ?? [];
            setValue("otherProgressTracking", [...currentOtherMethods, customProgressTrackingInput]);
            setCustomProgressTrackingInput("");
        }
    };

    const removeOtherMotivation = (motivation: string) => {
        const currentOtherMotivations = watch("otherMotivation") ?? [];
        setValue("otherMotivation", currentOtherMotivations.filter(m => m !== motivation));
    };

    const removeOtherProgressTracking = (method: string) => {
        const currentOtherMethods = watch("otherProgressTracking") ?? [];
        setValue("otherProgressTracking", currentOtherMethods.filter(m => m !== method));
    };

    const onSubmit = async (): Promise<boolean> => {
        setIsSubmitting(true);

        try {
            let isValid = false;
            await handleSubmit(async (data) => {
                console.log("Motivation preferences data submitted:", data);
                isValid = true;
            })();
            return isValid;
        } catch (error) {
            console.error("Form validation failed:", error);
            return false;
        } finally {
            setIsSubmitting(false);
        }
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Motivation & Preferences</h2>
                <div className="space-y-8">
                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-4">
                            What motivates you to exercise?
                        </label>
                        {errors.motivation && (
                            <p className="mb-2 text-sm text-red-600">{errors.motivation.message}</p>
                        )}
                        <Controller
                            name="motivation"
                            control={control}
                            render={({ field }) => (
                                <MultiSelectPills
                                    options={["Health benefits", "Stress relief", "Social aspects", "Weight management", "Athletic performance", "Mental wellbeing", "Appearance", "Doctor's recommendation", "Other"]}
                                    selectedValues={field.value}
                                    onChange={handleMotivationChange}
                                />
                            )}
                        />
                        {watch("motivation").includes("Other") && <div className="mt-4 flex gap-2">
                            <Input
                                value={customMotivationInput}
                                onChange={(e) => setCustomMotivationInput(e.target.value)}
                                type="text"
                                placeholder="Add custom motivation"
                                className={`flex-1 rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm ${errors.otherMotivation ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-indigo-500"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={handleCustomMotivation}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add
                            </button>
                        </div>}
                        {errors.otherMotivation && watch("motivation").includes("Other") && (
                            <p className="mt-2 text-sm text-red-600">{errors.otherMotivation.message}</p>
                        )}
                        <div className="mt-3 space-y-2">
                            {watch("otherMotivation")?.map((motivation) => (
                                <div key={motivation} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                    <span className="text-sm text-gray-700">{motivation}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeOtherMotivation(motivation)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-4">
                            How would you like to track your progress?
                        </label>
                        {errors.progressTracking && (
                            <p className="mb-2 text-sm text-red-600">{errors.progressTracking.message}</p>
                        )}
                        <Controller
                            name="progressTracking"
                            control={control}
                            render={({ field }) => (
                                <MultiSelectPills
                                    options={["Body measurements", "Progress photos", "Strength gains", "Flexibility improvements", "Endurance tracking", "Habit tracking", "Journaling", "Other"]}
                                    selectedValues={field.value}
                                    onChange={handleProgressTrackingChange}
                                />
                            )}
                        />
                        {watch("progressTracking").includes("Other") && <div className="mt-4 flex gap-2">
                            <Input
                                value={customProgressTrackingInput}
                                onChange={(e) => setCustomProgressTrackingInput(e.target.value)}
                                type="text"
                                placeholder="Add custom tracking method"
                                className={`flex-1 rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm ${errors.otherProgressTracking ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-indigo-500"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={handleCustomProgressTracking}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add
                            </button>
                        </div>}
                        {errors.otherProgressTracking && watch("progressTracking").includes("Other") && (
                            <p className="mt-2 text-sm text-red-600">{errors.otherProgressTracking.message}</p>
                        )}
                        <div className="mt-3 space-y-2">
                            {watch("otherProgressTracking")?.map((method) => (
                                <div key={method} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                    <span className="text-sm text-gray-700">{method}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeOtherProgressTracking(method)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </form>
        </FormLayout>
    );
}