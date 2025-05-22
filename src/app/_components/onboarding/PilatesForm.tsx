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

interface PilatesFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

export const formSchema = z.object({
    pilatesExperience: z.boolean({
        required_error: "Please indicate if you have Pilates experience",
    }),
    pilatesDuration: z.enum(["Less than 3 months", "3-6 months", "6-12 months", "1-3 years", "More than 3 years"]).optional(),
    studioFrequency: z.enum(["Never", "1-2 times per month", "1 time per week", "2-3 times per week", "4+ times per week"], {
        required_error: "Please select how often you can attend in-studio sessions",
    }),
    sessionPreference: z.enum(["Group classes", "Private sessions", "Both", "No preference"], {
        required_error: "Please select your session preference",
    }),
    instructors: z.array(z.string()).min(1, "Please select at least one instructor or add a custom one"),
    customInstructor: z.string().optional(),
    apparatusPreference: z.array(z.string()).min(1, "Please select at least one apparatus preference"),
    customApparatus: z.string().optional(),
}).refine(
    (data) => {
        return data.pilatesExperience ? data.pilatesDuration !== undefined : true;
    },
    {
        message: "Please select your Pilates experience duration",
        path: ["pilatesDuration"],
    }
);

export default function PilatesForm({ isFirstStep, isLastStep, currentStep }: PilatesFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            pilatesExperience: isDeveloper() ? false : undefined,
            pilatesDuration: isDeveloper() ? "3-6 months" : undefined,
            studioFrequency: isDeveloper() ? "1 time per week" : undefined,
            sessionPreference: isDeveloper() ? "Group classes" : undefined,
            instructors: isDeveloper() ? ["Instructor 1", "Instructor 2"] : [],
            customInstructor: isDeveloper() ? "Instructor 3" : "",
            apparatusPreference: isDeveloper() ? ["Reformer", "Cadillac"] : [],
            customApparatus: "",
        }
    });
    const { mutate: postPilatesExperience } = api.onboarding.postPilatesExperience.useMutation()
    const pilatesExperience = watch("pilatesExperience");
    const handleInstructorsChange = (instructor: string) => {
        const currentInstructors = watch("instructors");
        const newInstructors = currentInstructors.includes(instructor)
            ? currentInstructors.filter(i => i !== instructor)
            : [...currentInstructors, instructor];
        setValue("instructors", newInstructors);
    };

    const handleApparatusChange = (apparatus: string) => {
        const currentApparatus = watch("apparatusPreference");
        const newApparatus = currentApparatus.includes(apparatus)
            ? currentApparatus.filter(a => a !== apparatus)
            : [...currentApparatus, apparatus];
        setValue("apparatusPreference", newApparatus);
    };

    const handleCustomInstructor = () => {
        const customInstructor = watch("customInstructor") ?? "";
        if (customInstructor.trim()) {
            const currentInstructors = watch("instructors");
            setValue("instructors", [...currentInstructors, customInstructor]);
            setValue("customInstructor", "");
        }
    };

    const handleCustomApparatus = () => {
        const customApparatus = watch("customApparatus") ?? "";
        if (customApparatus.trim()) {
            const currentApparatus = watch("apparatusPreference");
            setValue("apparatusPreference", [...currentApparatus, customApparatus]);
            setValue("customApparatus", "");
        }
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
                        <label htmlFor="studio-frequency" className="block text-sm font-medium text-gray-700">
                            How often can you attend in-studio Pilates sessions?
                        </label>
                        {errors.studioFrequency && (
                            <p className="mt-1 text-sm text-red-600">{errors.studioFrequency.message}</p>
                        )}
                        <Controller
                            name="studioFrequency"
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
                                        <SelectItem value="Never">Never</SelectItem>
                                        <SelectItem value="1-2 times per month">1-2 times per month</SelectItem>
                                        <SelectItem value="1 time per week">1 time per week</SelectItem>
                                        <SelectItem value="2-3 times per week">2-3 times per week</SelectItem>
                                        <SelectItem value="4+ times per week">4+ times per week</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div>
                        <label htmlFor="session-preference" className="block text-sm font-medium text-gray-700">
                            Do you prefer group classes or private sessions?
                        </label>
                        {errors.sessionPreference && (
                            <p className="mt-1 text-sm text-red-600">{errors.sessionPreference.message}</p>
                        )}
                        <Controller
                            name="sessionPreference"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select preference" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Group classes">Group classes</SelectItem>
                                        <SelectItem value="Private sessions">Private sessions</SelectItem>
                                        <SelectItem value="Both">Both</SelectItem>
                                        <SelectItem value="No preference">No preference</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-4">
                            Which Pilates instructors at the studio have you worked with before, if any?
                        </label>
                        {errors.instructors && (
                            <p className="mb-2 text-sm text-red-600">{errors.instructors.message}</p>
                        )}
                        <Controller
                            name="instructors"
                            control={control}
                            render={({ field }) => (
                                <MultiSelectPills
                                    options={["None yet"]}
                                    selectedValues={field.value}
                                    onChange={handleInstructorsChange}
                                />
                            )}
                        />
                        <div className="mt-4 flex gap-2">
                            <Input
                                {...register("customInstructor")}
                                type="text"
                                placeholder="Add instructor name"
                                className="flex-1"
                            />
                            <button
                                type="button"
                                onClick={handleCustomInstructor}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add
                            </button>
                        </div>
                        <div className="mt-3 space-y-2">
                            {watch("instructors")
                                .filter(instructor => instructor !== "None yet")
                                .map((instructor) => (
                                    <div key={instructor} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                        <span className="text-sm text-gray-700">{instructor}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleInstructorsChange(instructor)}
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
                            Are there specific Pilates apparatus you enjoy using or want to learn?
                        </label>
                        {errors.apparatusPreference && (
                            <p className="mb-2 text-sm text-red-600">{errors.apparatusPreference.message}</p>
                        )}
                        <Controller
                            name="apparatusPreference"
                            control={control}
                            render={({ field }) => (
                                <MultiSelectPills
                                    options={["Reformer", "Cadillac", "Chair", "Barrel", "Tower", "Mat work only", "Not sure yet"]}
                                    selectedValues={field.value}
                                    onChange={handleApparatusChange}
                                />
                            )}
                        />
                        <div className="mt-4 flex gap-2">
                            <Input
                                {...register("customApparatus")}
                                type="text"
                                placeholder="Add custom apparatus"
                                className="flex-1"
                            />
                            <button
                                type="button"
                                onClick={handleCustomApparatus}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add
                            </button>
                        </div>
                        <div className="mt-3 space-y-2">
                            {watch("apparatusPreference")
                                .filter(apparatus => !["Reformer", "Cadillac", "Chair", "Barrel", "Tower", "Mat work only", "Not sure yet"].includes(apparatus))
                                .map((apparatus) => (
                                    <div key={apparatus} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                        <span className="text-sm text-gray-700">{apparatus}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleApparatusChange(apparatus)}
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