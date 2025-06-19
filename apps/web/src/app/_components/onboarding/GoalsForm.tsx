import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { STEPS } from "@/app/onboarding/constants";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FormLayout from "./FormLayout";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { api } from "@/trpc/react";
import { isDeveloper } from "@/app/_utils/user-role";
import { GOAL_TIMELINE, GOALS } from "@/app/_constants/goals";

interface GoalsFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

export const formSchema = z.object({
    fitnessGoals: z.array(z.string()).min(1, "Please select at least one goal"),
    goalTimeline: z.enum(GOAL_TIMELINE, {
        required_error: "Please select your goal timeline",
    }),
    specificGoals: z.string().optional(),
});

export default function GoalsForm({ isFirstStep, isLastStep, currentStep }: GoalsFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { handleSubmit, formState: { errors }, control, watch, setValue } = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            fitnessGoals: isDeveloper() ? ["Lose weight"] : [],
            goalTimeline: isDeveloper() ? "3-6 months" : undefined,
            specificGoals: isDeveloper() ? "Developer testing" : "",
        }
    });
    const { mutate: postFitnessGoals } = api.onboarding.postFitnessGoals.useMutation()
    const handleFitnessGoalsChange = (goal: string) => {
        const currentGoals = watch("fitnessGoals");
        const newGoals = currentGoals.includes(goal)
            ? currentGoals.filter(g => g !== goal)
            : [...currentGoals, goal];
        setValue("fitnessGoals", newGoals);
    };

    const onSubmit = async (): Promise<boolean> => {
        setIsSubmitting(true);

        try {
            let isValid = false;
            await handleSubmit(async (data) => {
                postFitnessGoals(data);
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Fitness Goals</h2>
                <div className="space-y-8">
                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-4">
                            What are your primary fitness goals? (Select all that apply)
                        </label>
                        {errors.fitnessGoals && (
                            <p className="mb-2 text-sm text-red-600">{errors.fitnessGoals.message}</p>
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
                    </div>

                    <div>
                        <label htmlFor="goal-timeline" className="block text-base font-medium text-gray-700 mb-4">
                            What is your timeline for achieving these goals?
                        </label>
                        {errors.goalTimeline && (
                            <p className="mb-2 text-sm text-red-600">{errors.goalTimeline.message}</p>
                        )}
                        <Controller
                            name="goalTimeline"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select timeline" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GOAL_TIMELINE.map((timeline) => (
                                            <SelectItem key={timeline} value={timeline}>{timeline}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div>
                        <label htmlFor="specific-goals" className="block text-sm font-medium text-gray-700">
                            Do you have any specific goals or milestones?
                        </label>
                        {errors.specificGoals && (
                            <p className="mt-1 text-sm text-red-600">{errors.specificGoals.message}</p>
                        )}
                        <Controller
                            name="specificGoals"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    id="specific-goals"
                                    rows={3}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm ${errors.specificGoals
                                        ? "border-red-500 focus:border-red-500"
                                        : "border-gray-300 focus:border-indigo-500"
                                        }`}
                                    placeholder="E.g., Run 5k, Lose 10kg, etc."
                                />
                            )}
                        />
                    </div>
                </div>
            </form>
        </FormLayout>
    );
}