import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { STEPS } from "@/app/onboarding/constants";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import Input from "../global/Input";
import FormLayout from "./FormLayout";
import { Button } from "@/components/ui/button";

interface FitnessBgFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

const formSchema = z.object({
    fitnessLevel: z.enum(["Beginner", "Intermediate", "Advanced"], {
        required_error: "Fitness level is required",
    }),
    exercises: z.array(z.string()).min(1, "Please select at least one exercise"),
    otherExercises: z.array(z.string()).optional(),
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
            // If "Other" is selected, at least one custom exercise must be added
            return !data.exercises.includes("Other") || (data.otherExercises && data.otherExercises.length > 0);
        },
        {
            message: "Please add at least one custom exercise",
            path: ["otherExercises"],
        }
    );

const EXERCISE_OPTIONS = ["Running", "Cycling", "Swimming", "Weightlifting", "Yoga", "Dance", "Team sports", "Other"];

export default function FitnessBgForm({ isFirstStep, isLastStep, currentStep }: FitnessBgFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            fitnessLevel: undefined,
            exercises: [],
            otherExercises: [],
            exerciseFrequency: undefined,
            sessionLength: undefined,
            customExercise: "",
        }
    });

    const handleExerciseChange = (exercise: string) => {
        const currentExercises = watch("exercises");
        const newExercises = currentExercises.includes(exercise)
            ? currentExercises.filter(e => e !== exercise)
            : [...currentExercises, exercise];
        setValue("exercises", newExercises);
    };

    const handleCustomExercise = () => {
        const customExercise = watch("customExercise") ?? "";
        if (customExercise.trim()) {
            const currentOtherExercises = watch("otherExercises") ?? [];
            setValue("otherExercises", [...currentOtherExercises, customExercise]);
            setValue("customExercise", "");
        }
    };

    const removeOtherExercise = (exercise: string) => {
        const currentOtherExercises = watch("otherExercises") ?? [];
        setValue("otherExercises", currentOtherExercises.filter(e => e !== exercise));
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
    const otherExercises = watch("otherExercises");

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
                            What forms of exercise do you currently engage in?
                        </label>
                        {errors.exercises && (
                            <p className="mt-1 text-sm text-red-600">{errors.exercises.message}</p>
                        )}
                        <div className="mt-4">
                            <Controller
                                name="exercises"
                                control={control}
                                render={({ field }) => (
                                    <MultiSelectPills
                                        options={EXERCISE_OPTIONS}
                                        selectedValues={field.value}
                                        onChange={handleExerciseChange}
                                    />
                                )}
                            />
                        </div>
                        {watch("exercises")?.includes("Other") && (
                            <div className="mt-4 space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        {...register("customExercise")}
                                        type="text"
                                        placeholder="Add custom exercise"
                                        className={`flex-1 rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm ${errors.otherExercises ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-indigo-500"
                                            }`}
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleCustomExercise}
                                        className="rounded-md"
                                    >
                                        Add
                                    </Button>
                                </div>
                                {errors.otherExercises && (
                                    <p className="text-sm text-red-600">{errors.otherExercises.message}</p>
                                )}
                                {otherExercises && otherExercises.length > 0 && (
                                    <div className="space-y-2">
                                        {watch("otherExercises")?.map((exercise) => (
                                            <div key={exercise} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                                <span className="text-sm text-gray-700">{exercise}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeOtherExercise(exercise)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
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