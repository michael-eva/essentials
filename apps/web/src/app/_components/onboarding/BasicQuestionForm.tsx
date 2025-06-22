import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Input from "../global/Input";

import { STEPS } from "@/app/onboarding/constants";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import FormLayout from "./FormLayout";
import { api } from "@/trpc/react";
import { isDeveloper } from "@/app/_utils/user-role";
import { GENDER } from "@/app/_constants/gender";

export const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    age: z.preprocess(
        (val) => {
            if (val === "" || val === undefined || val === null) return undefined;
            const num = typeof val === "number" ? val : Number(val);
            return isNaN(num) ? undefined : num;
        },
        z.number({ required_error: "Age is required" })
            .min(0, "Age must be positive")
            .max(120, "Age seems invalid")
    ),
    height: z.preprocess(
        (val) => {
            if (val === "" || val === undefined || val === null) return undefined;
            const num = typeof val === "number" ? val : Number(val);
            return isNaN(num) ? undefined : num;
        },
        z.number({ required_error: "Height is required" })
            .min(0, "Height must be positive")
            .max(300, "Height seems invalid")
    ),
    weight: z.preprocess(
        (val) => {
            if (val === "" || val === undefined || val === null) return undefined;
            const num = typeof val === "number" ? val : Number(val);
            return isNaN(num) ? undefined : num;
        },
        z.number({ required_error: "Weight is required" })
            .min(0, "Weight must be positive")
            .max(500, "Weight seems invalid")
    ),
    gender: z.enum(GENDER, {
        required_error: "Gender is required",
    }),
});

type BasicQuestionFormData = z.infer<typeof formSchema>;

interface BasicQuestionFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

export default function BasicQuestionForm({ isFirstStep, isLastStep, currentStep }: BasicQuestionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, control } = useForm<BasicQuestionFormData>({
        mode: "onChange",
        defaultValues: {
            name: isDeveloper() ? "Developer User" : "",
            age: isDeveloper() ? 25 : undefined,
            height: isDeveloper() ? 170 : undefined,
            weight: isDeveloper() ? 70 : undefined,
            gender: isDeveloper() ? "Prefer not to say" : undefined,
        }
    });
    const { mutate: postBasicQuestions } = api.onboarding.postBasicQuestions.useMutation();
    const onSubmit = async (): Promise<boolean> => {
        setIsSubmitting(true);

        try {
            let isValid = false;
            await handleSubmit(async (data) => {
                postBasicQuestions(data);
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
                <h2 className="text-2xl font-medium text-gray-900">Basic Information</h2>
                <p className="text-gray-500">Tell us a bit about yourself to personalize your experience.</p>

                <div className="space-y-8">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            What is your name?
                        </label>
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                        <Input
                            {...register("name")}
                            type="text"
                            id="name"
                            className="block w-full rounded-md border-gray-200 shadow-sm focus:border-gray-900 focus:ring-gray-900 px-4 py-3"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                            What is your age?
                        </label>
                        {errors.age && (
                            <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                        )}
                        <Input
                            {...register("age", { valueAsNumber: true })}
                            type="number"
                            id="age"
                            className="block w-full rounded-md border-gray-200 shadow-sm focus:border-gray-900 focus:ring-gray-900 px-4 py-3"
                            placeholder="Enter your age"
                        />
                    </div>

                    <div>
                        <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                            What is your height? (cm)
                        </label>
                        {errors.height && (
                            <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>
                        )}
                        <Input
                            {...register("height", { valueAsNumber: true })}
                            type="number"
                            id="height"
                            className="block w-full rounded-md border-gray-200 shadow-sm focus:border-gray-900 focus:ring-gray-900 px-4 py-3"
                            placeholder="Enter your height in cm"
                        />
                    </div>

                    <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                            What is your weight? (kg)
                        </label>
                        {errors.weight && (
                            <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
                        )}
                        <Input
                            {...register("weight", { valueAsNumber: true })}
                            type="number"
                            id="weight"
                            className="block w-full rounded-md border-gray-200 shadow-sm focus:border-gray-900 focus:ring-gray-900 px-4 py-3"
                            placeholder="Enter your weight in kg"
                        />
                    </div>

                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                            What is your gender?
                        </label>
                        {errors.gender && (
                            <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                        )}
                        <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger className="w-full rounded-md border-gray-200 px-4 py-3 focus:border-gray-900 focus:ring-gray-900">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-md">
                                        {GENDER.map((gender) => (
                                            <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                                        ))}
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