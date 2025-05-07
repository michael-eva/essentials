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

interface FitnessBgFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

const formSchema = z.object({
    fitnessLevel: z.enum(["Beginner", "Intermediate", "Advanced"], {
        required_error: "Fitness level is required",
    }),
    pilatesExperience: z.boolean({
        required_error: "Please indicate if you have Pilates experience",
    }),
    pilatesDuration: z.enum(["Less than 3 months", "3-6 months", "6-12 months", "1-3 years", "More than 3 years"]).optional(),
    otherExercises: z.array(z.string()).min(1, "Please select at least one exercise"),
    exerciseFrequency: z.enum(["0", "1-2", "3-4", "5+"], {
        required_error: "Exercise frequency is required",
    }),
    sessionLength: z.enum(["Less than 15 minutes", "15-30 minutes", "30-45 minutes", "45-60 minutes", "More than 60 minutes"], {
        required_error: "Session length is required",
    }),
    customExercise: z.string().optional(),
})
    .refine(
        (data) => {
            return data.pilatesExperience ? data.pilatesDuration !== undefined : true;
        },
        {
            message: "Please select your Pilates experience duration",
            path: ["pilatesDuration"],
        }
    );

export default function FitnessBgForm({ isFirstStep, isLastStep, currentStep }: FitnessBgFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            fitnessLevel: undefined,
            pilatesExperience: undefined,
            pilatesDuration: undefined,
            otherExercises: [],
            exerciseFrequency: undefined,
            sessionLength: undefined,
            customExercise: "",
        }
    });

    const pilatesExperience = watch("pilatesExperience");

    const handleOtherExercisesChange = (exercise: string) => {
        const currentExercises = watch("otherExercises");
        const newExercises = currentExercises.includes(exercise)
            ? currentExercises.filter(e => e !== exercise)
            : [...currentExercises, exercise];
        setValue("otherExercises", newExercises);
    };

    const handleCustomExercise = () => {
        const customExercise = watch("customExercise") || "";
        if (customExercise.trim()) {
            const currentExercises = watch("otherExercises");
            setValue("otherExercises", [...currentExercises, customExercise]);
            setValue("customExercise", "");
        }
    };

    const onSubmit = async (): Promise<boolean> => {
        setIsSubmitting(true);

        try {
            let isValid = false;
            await handleSubmit(async (data) => {
                console.log("Fitness background data submitted:", data);
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
                <h2 className="text-2xl font-medium text-gray-900">Fitness Background</h2>
                <div className="space-y-8">
                    <div>
                        <label htmlFor="fitness-level" className="block text-sm font-medium text-gray-700">
                            How would you rate your current fitness level?
                        </label>
                        {errors.fitnessLevel && (
                            <p className="mt-1 text-sm text-red-600">{errors.fitnessLevel.message}</p>
                        )}
                        <Controller
                            name="fitnessLevel"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Have you practiced Pilates before?
                        </label>
                        {errors.pilatesExperience && (
                            <p className="mt-1 text-sm text-red-600">{errors.pilatesExperience.message}</p>
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

                    {pilatesExperience && (
                        <div>
                            <label htmlFor="pilates-duration" className="block text-sm font-medium text-gray-700">
                                How long have you been practicing Pilates?
                            </label>
                            {errors.pilatesDuration && (
                                <p className="mt-1 text-sm text-red-600">{errors.pilatesDuration.message}</p>
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
                                            <SelectItem value="Less than 3 months">Less than 3 months</SelectItem>
                                            <SelectItem value="3-6 months">3-6 months</SelectItem>
                                            <SelectItem value="6-12 months">6-12 months</SelectItem>
                                            <SelectItem value="1-3 years">1-3 years</SelectItem>
                                            <SelectItem value="More than 3 years">More than 3 years</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            What other forms of exercise do you currently engage in?
                        </label>
                        {errors.otherExercises && (
                            <p className="mt-1 text-sm text-red-600">{errors.otherExercises.message}</p>
                        )}
                        <div className="mt-4">
                            <Controller
                                name="otherExercises"
                                control={control}
                                render={({ field }) => (
                                    <MultiSelectPills
                                        options={["Running", "Cycling", "Swimming", "Weightlifting", "Yoga", "Dance", "Team sports", "Other", "None"]}
                                        selectedValues={field.value}
                                        onChange={handleOtherExercisesChange}
                                    />
                                )}
                            />
                        </div>
                        {watch("otherExercises").includes("Other") && <div className="mt-4 flex gap-2">
                            <Input
                                {...register("customExercise")}
                                type="text"
                                placeholder="Add custom exercise"
                                className="flex-1"
                            />
                            <button
                                type="button"
                                onClick={handleCustomExercise}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add
                            </button>
                        </div>}
                    </div>

                    <div>
                        <label htmlFor="exercise-frequency" className="block text-sm font-medium text-gray-700">
                            How many days per week do you currently exercise?
                        </label>
                        {errors.exerciseFrequency && (
                            <p className="mt-1 text-sm text-red-600">{errors.exerciseFrequency.message}</p>
                        )}
                        <Controller
                            name="exerciseFrequency"
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
                                        <SelectItem value="0">0</SelectItem>
                                        <SelectItem value="1-2">1-2</SelectItem>
                                        <SelectItem value="3-4">3-4</SelectItem>
                                        <SelectItem value="5+">5+</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div>
                        <label htmlFor="session-length" className="block text-sm font-medium text-gray-700">
                            How long are your typical workout sessions?
                        </label>
                        {errors.sessionLength && (
                            <p className="mt-1 text-sm text-red-600">{errors.sessionLength.message}</p>
                        )}
                        <Controller
                            name="sessionLength"
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
                                        <SelectItem value="Less than 15 minutes">Less than 15 minutes</SelectItem>
                                        <SelectItem value="15-30 minutes">15-30 minutes</SelectItem>
                                        <SelectItem value="30-45 minutes">30-45 minutes</SelectItem>
                                        <SelectItem value="45-60 minutes">45-60 minutes</SelectItem>
                                        <SelectItem value="More than 60 minutes">More than 60 minutes</SelectItem>
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