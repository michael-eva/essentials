// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useState } from "react";
// import { STEPS } from "@/app/onboarding/constants";
// import FormLayout from "./FormLayout";
// import { Label } from "@/components/ui/label";
// import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
// import { SECTION_LABELS } from "@/app/_constants/ui-labels";
// import { api } from "@/trpc/react";
// import { isDeveloper } from "@/app/_utils/user-role";
// import { workoutTimesEnum, weekendTimesEnum } from "@/drizzle/src/db/schema";

// const TIME_OPTIONS = workoutTimesEnum.enumValues;
// const WEEKEND_OPTIONS = weekendTimesEnum.enumValues;

// interface WorkoutTimingFormProps {
//   isFirstStep?: boolean;
//   isLastStep?: boolean;
//   currentStep: (typeof STEPS)[number];
// }

// export const formSchema = z.object({
//   preferredWorkoutTimes: z
//     .string()
//     .array()
//     .min(1, "Please select at least one preferred time"),
//   avoidedWorkoutTimes: z
//     .string()
//     .array()
//     .min(1, "Please select at least one avoided time"),
//   weekendWorkoutTimes: z.enum(WEEKEND_OPTIONS, {
//     required_error: "Please select a weekend workout time",
//   }),
// });

// export default function WorkoutTimingForm(props: WorkoutTimingFormProps) {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const {
//     handleSubmit,
//     formState: { errors },
//     control,
//     watch,
//     setValue,
//   } = useForm({
//     resolver: zodResolver(formSchema),
//     mode: "onChange",
//     defaultValues: {
//       preferredWorkoutTimes: isDeveloper() ? [TIME_OPTIONS[0]] : [],
//       avoidedWorkoutTimes: isDeveloper() ? [TIME_OPTIONS[0]] : [],
//       weekendWorkoutTimes: isDeveloper() ? WEEKEND_OPTIONS[0] : undefined,
//     },
//   });
//   const { mutate: postWorkoutTiming } =
//     api.onboarding.postWorkoutTiming.useMutation();

//   const handlePreferredTimesChange = (value: string) => {
//     const currentValues = watch("preferredWorkoutTimes");
//     const newValues = currentValues.includes(value)
//       ? currentValues.filter((v) => v !== value)
//       : [...currentValues, value];
//     setValue("preferredWorkoutTimes", newValues, { shouldValidate: true });
//   };

//   const handleAvoidedTimesChange = (value: string) => {
//     const currentValues = watch("avoidedWorkoutTimes") ?? [];
//     const newValues = currentValues.includes(value)
//       ? currentValues.filter((v) => v !== value)
//       : [...currentValues, value];
//     setValue("avoidedWorkoutTimes", newValues, { shouldValidate: true });
//   };

//   const onSubmit = async (): Promise<boolean> => {
//     setIsSubmitting(true);
//     try {
//       let isValid = false;
//       await handleSubmit(async (data) => {
//         postWorkoutTiming({
//           ...data,
//           preferredWorkoutTimes:
//             data.preferredWorkoutTimes as (typeof TIME_OPTIONS)[number][],
//           avoidedWorkoutTimes:
//             data.avoidedWorkoutTimes as (typeof TIME_OPTIONS)[number][],
//         });
//         isValid = true;
//       })();
//       return isValid;
//     } catch (error) {
//       console.error("Form validation failed:", error);
//       return false;
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <FormLayout
//       onSubmit={onSubmit}
//       isFirstStep={props.isFirstStep}
//       isLastStep={props.isLastStep}
//       currentStep={props.currentStep}
//       isSubmitting={isSubmitting}
//     >
//       <form className="mx-auto max-w-md space-y-8 px-2">
//         <h2 className="text-2xl font-bold text-gray-900">
//           {SECTION_LABELS.WORKOUT_TIMING.TITLE}
//         </h2>
//         <div className="space-y-8">
//           <div>
//             <Label className="mb-2 text-base">
//               What time of day is best for you to work out?
//             </Label>
//             {errors.preferredWorkoutTimes && (
//               <p className="mb-1 text-sm text-red-600">
//                 {errors.preferredWorkoutTimes.message!}
//               </p>
//             )}
//             <Controller
//               name="preferredWorkoutTimes"
//               control={control}
//               render={({ field }) => (
//                 <MultiSelectPills
//                   options={TIME_OPTIONS}
//                   selectedValues={field.value}
//                   onChange={handlePreferredTimesChange}
//                 />
//               )}
//             />
//           </div>
//           <div>
//             <Label className="mb-2 text-base">
//               Are there times you prefer not to work out?
//             </Label>
//             {errors.avoidedWorkoutTimes && (
//               <p className="mb-1 text-sm text-red-600">
//                 {errors.avoidedWorkoutTimes.message!}
//               </p>
//             )}
//             <Controller
//               name="avoidedWorkoutTimes"
//               control={control}
//               render={({ field }) => (
//                 <MultiSelectPills
//                   options={TIME_OPTIONS}
//                   selectedValues={field.value ?? []}
//                   onChange={handleAvoidedTimesChange}
//                 />
//               )}
//             />
//           </div>
//           <div>
//             <Label className="mb-2 text-base">
//               Do you usually work out on weekends?
//             </Label>
//             {errors.weekendWorkoutTimes && (
//               <p className="mt-1 text-sm text-red-600">
//                 {errors.weekendWorkoutTimes.message!}
//               </p>
//             )}
//             <Controller
//               name="weekendWorkoutTimes"
//               control={control}
//               render={({ field }) => (
//                 <MultiSelectPills
//                   options={WEEKEND_OPTIONS}
//                   selectedValues={field.value ? [field.value] : []}
//                   onChange={field.onChange}
//                   singleSelect
//                 />
//               )}
//             />
//           </div>
//         </div>
//       </form>
//     </FormLayout>
//   );
// }
