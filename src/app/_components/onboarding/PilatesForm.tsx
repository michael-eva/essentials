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
import { PILATES_APPARATUS, PILATES_DURATION, PILATES_SESSION_PREFERENCE, PILATES_SESSIONS, CUSTOM_PILATES_APPARATUS } from "@/app/_constants/pilates";
import { handleNoneMultiSelect } from "@/app/_utils/multiSelectNoneUtils";

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
    otherApparatusPreferences: z.array(z.string()).optional(),
    customApparatus: z.array(z.string()).min(1, "Please select at least one apparatus preference"),
    otherCustomApparatus: z.array(z.string()).optional(),
}).refine(
    (data) => {
        return data.pilatesExperience ? data.pilatesDuration !== undefined : true;
    },
    {
        message: "Please select your Pilates experience duration",
        path: ["pilatesDuration"],
    }
).refine(
    (data) => {
        return !data.apparatusPreference.includes("Other") || (data.otherApparatusPreferences && data.otherApparatusPreferences.length > 0);
    },
    {
        message: "Please add at least one custom apparatus",
        path: ["otherApparatusPreferences"],
    }
).refine(
    (data) => {
        return !data.customApparatus.includes("Other") || (data.otherCustomApparatus && data.otherCustomApparatus.length > 0);
    },
    {
        message: "Please add at least one custom home apparatus",
        path: ["otherCustomApparatus"],
    }
);

export default function PilatesForm({ isFirstStep, isLastStep, currentStep }: PilatesFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [otherApparatusPreferenceInput, setotherApparatusPreferenceInput] = useState("");
    const [otherApparatusPreferenceList, setotherApparatusPreferenceList] = useState<string[]>([]);
    const [otherCustomApparatusInput, setOtherCustomApparatusInput] = useState("");
    const [otherCustomApparatusList, setOtherCustomApparatusList] = useState<string[]>([]);
    const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            pilatesExperience: isDeveloper() ? false : undefined,
            pilatesDuration: isDeveloper() ? "3-6 months" : undefined,
            studioFrequency: isDeveloper() ? "1 time per week" : undefined,
            sessionPreference: isDeveloper() ? "Group classes" : undefined,
            apparatusPreference:[],
            otherApparatusPreferences: [],
            customApparatus: [],
            otherCustomApparatus: [],
        }
    });
    const { mutate: postPilatesExperience } = api.onboarding.postPilatesExperience.useMutation()
    const pilatesExperience = watch("pilatesExperience");

    const handleApparatusChange = (apparatus: string) => {
        const currentApparatus = watch("apparatusPreference");
        const newApparatus = handleNoneMultiSelect(currentApparatus, apparatus)
        setValue("apparatusPreference", newApparatus);
    };

    // Custom apparatus handlers
    const handleOtherApparatusPreferenceAdd = () => {
        if (otherApparatusPreferenceInput.trim()) {
            const updated = [...otherApparatusPreferenceList, otherApparatusPreferenceInput];
            setotherApparatusPreferenceList(updated);
            setValue("otherApparatusPreferences", updated);
            setotherApparatusPreferenceInput("");
        }
    };
    const removeOtherApparatusPreference = (apparatus: string) => {
        const updated = otherApparatusPreferenceList.filter((a) => a !== apparatus);
        setotherApparatusPreferenceList(updated);
        setValue("otherApparatusPreferences", updated);
    };

    // Other custom home apparatus handlers
    const handleOtherCustomApparatusAdd = () => {
        if (otherCustomApparatusInput.trim()) {
            const updated = [...otherCustomApparatusList, otherCustomApparatusInput];
            setOtherCustomApparatusList(updated);
            setValue("otherCustomApparatus", updated);
            setOtherCustomApparatusInput("");
        }
    };
    const removeOtherCustomApparatus = (apparatus: string) => {
        const updated = otherCustomApparatusList.filter((a) => a !== apparatus);
        setOtherCustomApparatusList(updated);
        setValue("otherCustomApparatus", updated);
    };

    const handleCustomApparatusChange = (apparatus: string) => {
        const currentApparatus = watch("customApparatus") ?? [];
        const newApparatus = handleNoneMultiSelect(currentApparatus, apparatus)
        setValue("customApparatus", newApparatus);
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
                        <label htmlFor="studio-frequency" className="mb-2 block text-sm font-medium text-gray-700">
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
                        <label htmlFor="session-preference" className="mb-2 block text-sm font-medium text-gray-700">
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
                        <label className="block text-sm font-medium text-gray-700 mb-4">
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
                        {/* Custom apparatus preference input if 'Other' is selected */}
                        {watch("apparatusPreference").includes("Other") && (
                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <Input
                                        value={otherApparatusPreferenceInput}
                                        onChange={(e) => setotherApparatusPreferenceInput(e.target.value)}
                                        type="text"
                                        placeholder="Add apparatus"
                                        className={`flex-1 rounded-md text-sm shadow-sm focus:ring-indigo-500 ${
                                            errors.otherApparatusPreferences
                                                ? "border-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:border-indigo-500"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleOtherApparatusPreferenceAdd}
                                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm leading-4 font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                                    >
                                        Add
                                    </button>
                                </div>
                                {errors.otherApparatusPreferences && (
                                    <p className="mt-2 text-sm text-red-600">{errors.otherApparatusPreferences.message}</p>
                                )}
                                <div className="mt-3 space-y-2">
                                    {otherApparatusPreferenceList.map((apparatus) => (
                                        <div key={apparatus} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                            <span className="text-sm text-gray-700">{apparatus}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeOtherApparatusPreference(apparatus)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-8">
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Do you use any of the following at home?
                            </label>
                            {errors.customApparatus && (
                            <p className="mb-2 text-sm text-red-600">{errors.customApparatus?.message}</p>
                        )}
                            <Controller
                                name="customApparatus"
                                control={control}
                                render={({ field }) => (
                                    <MultiSelectPills
                                        options={CUSTOM_PILATES_APPARATUS}
                                        selectedValues={field.value}
                                        onChange={handleCustomApparatusChange}
                                    />
                                )}
                            />
                            {/* Custom apparatus input if 'Other' is selected */}
                        {watch("customApparatus").includes("Other") && (
                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <Input
                                        value={otherCustomApparatusInput}
                                        onChange={(e) => setOtherCustomApparatusInput(e.target.value)}
                                        type="text"
                                        placeholder="Add apparatus"
                                        className={`flex-1 rounded-md text-sm shadow-sm focus:ring-indigo-500 ${
                                            errors.otherCustomApparatus
                                                ? "border-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:border-indigo-500"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleOtherCustomApparatusAdd}
                                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm leading-4 font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                                    >
                                        Add
                                    </button>
                                </div>
                                {errors.otherCustomApparatus && (
                                    <p className="mt-2 text-sm text-red-600">{errors.otherCustomApparatus.message}</p>
                                )}
                                <div className="mt-3 space-y-2">
                                    {otherCustomApparatusList.map((apparatus) => (
                                        <div key={apparatus} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                            <span className="text-sm text-gray-700">{apparatus}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeOtherCustomApparatus(apparatus)}
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
                    </div>
                </div>
            </form>
        </FormLayout>
    );
}