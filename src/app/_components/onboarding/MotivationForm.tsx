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
import FormLayout from "./FormLayout";

interface MotivationFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

const formSchema = z.object({
    motivation: z.array(z.string()).min(1, "Please select at least one motivation factor"),
    customMotivation: z.string().optional(),
    progressTracking: z.array(z.string()).min(1, "Please select at least one progress tracking method"),
    customProgressTracking: z.string().optional(),
})

export default function MotivationForm({ isFirstStep, isLastStep, currentStep }: MotivationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            motivation: [],
            customMotivation: "",
            progressTracking: [],
            customProgressTracking: "",
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
        const customMotivation = watch("customMotivation") || "";
        if (customMotivation.trim()) {
            const currentMotivations = watch("motivation");
            setValue("motivation", [...currentMotivations, customMotivation]);
            setValue("customMotivation", "");
        }
    };

    const handleCustomProgressTracking = () => {
        const customMethod = watch("customProgressTracking") || "";
        if (customMethod.trim()) {
            const currentMethods = watch("progressTracking");
            setValue("progressTracking", [...currentMethods, customMethod]);
            setValue("customProgressTracking", "");
        }
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
                                {...register("customMotivation")}
                                type="text"
                                placeholder="Add custom motivation"
                                className="flex-1"
                            />
                            <button
                                type="button"
                                onClick={handleCustomMotivation}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add
                            </button>
                        </div>}
                        <div className="mt-3 space-y-2">
                            {watch("motivation")
                                .filter(motivation => !["Health benefits", "Stress relief", "Social aspects", "Weight management", "Athletic performance", "Mental wellbeing", "Appearance", "Doctor's recommendation", "Other"].includes(motivation))
                                .map((motivation) => (
                                    <div key={motivation} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                        <span className="text-sm text-gray-700">{motivation}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleMotivationChange(motivation)}
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
                                {...register("customProgressTracking")}
                                type="text"
                                placeholder="Add custom tracking method"
                                className="flex-1"
                            />
                            <button
                                type="button"
                                onClick={handleCustomProgressTracking}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add
                            </button>
                        </div>}
                        <div className="mt-3 space-y-2">
                            {watch("progressTracking")
                                .filter(method => !["Body measurements", "Progress photos", "Strength gains", "Flexibility improvements", "Endurance tracking", "Habit tracking", "Journaling", "Other"].includes(method))
                                .map((method) => (
                                    <div key={method} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                        <span className="text-sm text-gray-700">{method}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleProgressTrackingChange(method)}
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