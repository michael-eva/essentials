import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { STEPS } from "@/app/onboarding/constants";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import Input from "../global/Input";
import FormLayout from "./FormLayout";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/trpc/react";
import { isDeveloper } from "@/app/_utils/user-role";
import { PILATES_APPARATUS, PILATES_DURATION, PILATES_SESSION_PREFERENCE, PILATES_STYLES } from "@/app/_constants/pilates";
import { FITNESS_LEVEL } from "@/app/_constants/fitness";
import { handleNoneMultiSelect } from "@/app/_utils/multiSelectNoneUtils";
import { Textarea } from "@/components/ui/textarea";
import { GOALS } from "@/app/_constants/goals";

interface PilatesFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

export const formSchema = z.object({
    fitnessLevel: z.enum(FITNESS_LEVEL, {
        required_error: "Fitness level is required",
    }),
    pilatesExperience: z.boolean({
        required_error: "Please indicate if you have Pilates experience",
    }),
    pilatesDuration: z.enum(PILATES_DURATION).optional(),
    pilatesStyles: z.array(z.string()).optional(),
    homeEquipment: z.array(z.string()).optional(),
    fitnessGoals: z.array(z.string()).min(1, "Please select at least one goal"),
    otherFitnessGoals: z.array(z.string()).optional(),
    specificGoals: z.string().optional(),
}).refine(
    (data) => {
        return data.pilatesExperience ? data.pilatesDuration !== undefined : true;
    },
    {
        message: "Please select your Pilates experience duration",
        path: ["pilatesDuration"],
    }
)

export default function PilatesForm({ isFirstStep, isLastStep, currentStep }: PilatesFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customGoalInput, setCustomGoalInput] = useState("");
    const [customGoals, setCustomGoals] = useState<string[]>([]);
    const { handleSubmit, formState: { errors }, control, watch, setValue } = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            fitnessLevel: isDeveloper() ? "I've been working out for years and want to challenge myself" : undefined,
            pilatesExperience: isDeveloper() ? false : undefined,
            pilatesDuration: isDeveloper() ? "3-6 months" : undefined,
            homeEquipment: isDeveloper() ? ["Ankle weights", "Ball", "Weights", "Sliders", "Resistance bands", "Chair", "Foam Roller", "Blocks"] : undefined,
            pilatesStyles: isDeveloper() ? ["Pilates", "Barre", "Strength", "HIIT", "Yoga", "Stretching"] : undefined,
            fitnessGoals: isDeveloper() ? ["Get toned", "Increase strength", "Increase endurance", "Prenatal/postnatal fitness"] : undefined,
            otherFitnessGoals: isDeveloper() ? ["Gain muscle", "Improve balance", "Improve posture"] : undefined,
            specificGoals: isDeveloper() ? "Developer testing" : undefined,
        }
    });
    const { mutate: postPilatesExperience } = api.onboarding.postPilatesExperience.useMutation()
    const pilatesExperience = watch("pilatesExperience");

    const handleHomeEquipmentChange = (equipment: string) => {
        const currentEquipment = watch("homeEquipment") ?? [];
        const newEquipment = handleNoneMultiSelect(currentEquipment, equipment);
        setValue("homeEquipment", newEquipment);
    };

    const handlePilatesStylesChange = (style: string) => {
        const currentStyles = watch("pilatesStyles") ?? [];
        const newStyles = handleNoneMultiSelect(currentStyles, style);
        setValue("pilatesStyles", newStyles);
    };
    const handleFitnessGoalsChange = (goal: string) => {
        const currentGoals = watch("fitnessGoals");
        const newGoals = currentGoals.includes(goal)
            ? currentGoals.filter((g) => g !== goal)
            : [...currentGoals, goal];
        setValue("fitnessGoals", newGoals);
    };


    const handleCustomGoal = () => {
        if (customGoalInput.trim()) {
            const updated = [...customGoals, customGoalInput];
            setCustomGoals(updated);
            setValue("otherFitnessGoals", updated);
            setCustomGoalInput("");
        }
    };

    const removeCustomGoal = (goal: string) => {
        const updated = customGoals.filter((g) => g !== goal);
        setCustomGoals(updated);
        setValue("otherFitnessGoals", updated);
    };
    const onSubmit = async (): Promise<boolean> => {
        setIsSubmitting(true);

        try {
            let isValid = false;
            await handleSubmit(async (data) => {
                postPilatesExperience(data);
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
                <h2 className="text-2xl font-bold text-gray-900">Pilates Preferences</h2>
                <div className="space-y-8">
                    <div>
                        <label
                            htmlFor="fitness-level"
                            className="mb-2 block text-base font-medium text-gray-700"
                        >
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
                                    <SelectContent className="max-w-[80%]">
                                        {FITNESS_LEVEL.map((level) => (
                                            <SelectItem key={level} value={level}>{level}</SelectItem>
                                        ))}
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
                            <label htmlFor="pilates-duration" className="block text-sm font-medium text-gray-700 mb-2">
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
                                            {PILATES_DURATION.map((duration) => (
                                                <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                            What styles do you enjoy? (Select multiple)
                        </label>
                        {errors.pilatesStyles && (
                            <p className="mb-2 text-sm text-red-600">{errors.pilatesStyles?.message}</p>
                        )}
                        <Controller
                            name="pilatesStyles"
                            control={control}
                            render={({ field }) => (
                                <MultiSelectPills
                                    options={[...PILATES_STYLES]}
                                    selectedValues={field.value || []}
                                    onChange={handlePilatesStylesChange}
                                />
                            )}
                        />

                        <div className="mt-8">
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                What equipment do you have access to? (Select multiple)
                            </label>
                            {errors.homeEquipment && (
                                <p className="mb-2 text-sm text-red-600">{errors.homeEquipment?.message}</p>
                            )}
                            <Controller
                                name="homeEquipment"
                                control={control}
                                render={({ field }) => (
                                    <MultiSelectPills
                                        options={[...PILATES_APPARATUS]}
                                        selectedValues={field.value || []}
                                        onChange={handleHomeEquipmentChange}
                                    />
                                )}
                            />
                            <div className="mt-8">
                                <label className="mb-4 block text-base font-medium text-gray-700">
                                    What are your primary fitness goals? (Select all that apply)
                                </label>
                                {errors.fitnessGoals && (
                                    <p className="mb-2 text-sm text-red-600">
                                        {errors.fitnessGoals.message}
                                    </p>
                                )}
                                <Controller
                                    name="fitnessGoals"
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelectPills
                                            options={GOALS}
                                            selectedValues={field.value}
                                            onChange={handleFitnessGoalsChange}
                                        />
                                    )}
                                />
                                {watch("fitnessGoals").includes("Other") && (
                                    <div className="mt-4 flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <Input
                                                value={customGoalInput}
                                                onChange={(e) => setCustomGoalInput(e.target.value)}
                                                type="text"
                                                placeholder="Add custom goal"
                                                className={`flex-1 rounded-md text-sm shadow-sm focus:ring-indigo-500 ${errors.otherFitnessGoals
                                                    ? "border-red-500 focus:border-red-500"
                                                    : "border-gray-300 focus:border-indigo-500"
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCustomGoal}
                                                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm leading-4 font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        {errors.otherFitnessGoals && (
                                            <p className="mt-2 text-sm text-red-600">{errors.otherFitnessGoals.message}</p>
                                        )}
                                        <div className="mt-3 space-y-2">
                                            {customGoals.map((goal) => (
                                                <div key={goal} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                                    <span className="text-sm text-gray-700">{goal}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCustomGoal(goal)}
                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8">
                                <label
                                    htmlFor="specific-goals"
                                    className="block text-base font-medium text-gray-700"
                                >
                                    Do you have any specific goals or milestones?
                                </label>
                                {errors.specificGoals && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.specificGoals.message}
                                    </p>
                                )}
                                <Controller
                                    name="specificGoals"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            id="specific-goals"
                                            rows={3}
                                            className={`mt-1 block w-full rounded-md text-sm shadow-sm focus:ring-indigo-500 ${errors.specificGoals
                                                ? "border-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:border-indigo-500"
                                                }`}
                                            placeholder="E.g., Run 5k, Lose 10kg, etc."
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormLayout >
    );
}