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
import { PILATES_APPARATUS, PILATES_DURATION, PILATES_SESSION_PREFERENCE, PILATES_SESSIONS } from "@/app/_constants/pilates";

interface PilatesFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

export const formSchema = z.object({
    pilatesExperience: z.boolean({
        required_error: "Please indicate if you have Pilates experience",
    }),
    pilatesDuration: z.enum(PILATES_DURATION).optional(),
    studioFrequency: z.enum(PILATES_SESSIONS, {
        required_error: "Please select how often you can attend in-studio sessions",
    }),
    sessionPreference: z.enum(PILATES_SESSION_PREFERENCE, {
        required_error: "Please select your session preference",
    }),
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
            apparatusPreference: isDeveloper() ? ["Reformer", "Cadillac"] : [],
            customApparatus: "",
        }
    });
    const { mutate: postPilatesExperience } = api.onboarding.postPilatesExperience.useMutation()
    const pilatesExperience = watch("pilatesExperience");

    const handleApparatusChange = (apparatus: string) => {
        const currentApparatus = watch("apparatusPreference");
        const newApparatus = currentApparatus.includes(apparatus)
            ? currentApparatus.filter(a => a !== apparatus)
            : [...currentApparatus, apparatus];
        setValue("apparatusPreference", newApparatus);
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
                                        {PILATES_SESSIONS.map((session) => (
                                            <SelectItem key={session} value={session}>{session}</SelectItem>
                                        ))}
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
                                        {PILATES_SESSION_PREFERENCE.map((preference) => (
                                            <SelectItem key={preference} value={preference}>{preference}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
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
                                    options={PILATES_APPARATUS}
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