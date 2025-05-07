import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Input from "../global/Input";
import Select from "../global/Select";
import FormFooter from "./FormFooter";
import type { STEPS } from "@/app/onboarding/[tab]/page";

const formSchema = z.object({
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
    gender: z.enum(["Male", "Female", "Prefer not to say"], {
        required_error: "Gender is required",
    }),
});
interface BasicQuestionFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

export default function BasicQuestionForm({ isFirstStep, isLastStep, currentStep }: BasicQuestionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
    });

    const onSubmit = async (): Promise<boolean> => {
        setIsSubmitting(true);

        try {
            let isValid = false;
            await handleSubmit(async (data) => {
                console.log("Form data submitted:", data);
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
        <div className="pb-20">
            <form className="space-y-6 max-w-md mx-auto p-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            What is your name?
                        </label>
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                        <Input
                            {...register("name")}
                            type="text"
                            id="name"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                            What is your age?
                        </label>
                        {errors.age && (
                            <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                        )}
                        <Input
                            {...register("age", { valueAsNumber: true })}
                            type="number"
                            id="age"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                            What is your height? (cm)
                        </label>
                        {errors.height && (
                            <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>
                        )}
                        <Input
                            {...register("height", { valueAsNumber: true })}
                            type="number"
                            id="height"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                            What is your weight? (kg)
                        </label>
                        {errors.weight && (
                            <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
                        )}
                        <Input
                            {...register("weight", { valueAsNumber: true })}
                            type="number"
                            id="weight"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                            What is your gender?
                        </label>
                        {errors.gender && (
                            <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                        )}
                        <Select
                            {...register("gender")}
                            options={[
                                { value: "Male", label: "Male" },
                                { value: "Female", label: "Female" },
                                { value: "Prefer not to say", label: "Prefer not to say" }
                            ]}
                            placeholder="Select gender"
                            className="w-full"
                        />
                    </div>
                </div>
            </form>

            <FormFooter
                onSubmit={onSubmit}
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
                currentStep={currentStep}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}