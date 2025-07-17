// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// import { api } from "@/trpc/react";
// import { toast } from "sonner";
// import { GENDER } from "@/app/_constants/gender";
// import React from "react";
// import { Button } from "@/components/ui/button";
// import type { MissingFieldsGrouped } from "../../dashboard/MultiStepGeneratePlanDialog";
// import { DialogFooter } from "@/components/ui/dialog";

// // Define proper types for the form data
// type Gender = typeof GENDER[number];

// interface BasicQuestionsSubmitData {
//   name: string | null;
//   age: number | null;
//   height: number | null;
//   weight: number | null;
//   gender: Gender | null;
// }

// export default function BasicQuestionsForm({
//   missingFields,
//   isSubmitting,
//   onNext,
//   onPrevious
// }: {
//   missingFields?: MissingFieldsGrouped;
//   isSubmitting?: boolean;
//   onNext: () => void;
//   onPrevious: () => void;
// }) {
//   const utils = api.useUtils();
//   const { mutate: postBasicQuestions } = api.onboarding.postBasicQuestions.useMutation({
//     onSuccess: () => {
//       toast.success("Basic information saved successfully");
//       utils.onboarding.getOnboardingData.invalidate();
//       onNext();
//     },
//     onError: () => {
//       toast.error("Failed to save basic information");
//     }
//   });

//   // Get basic missing fields - much simpler!
//   const basicMissingFields = missingFields?.basic || [];
//   const hasMissingFields = basicMissingFields.length > 0;

//   // Create dynamic schema based on missingFields
//   const createSchema = () => {
//     const schemaFields: Record<string, z.ZodTypeAny> = {};

//     // Helper function to check if field is required
//     const isRequired = (fieldName: string) => {
//       return hasMissingFields && basicMissingFields.includes(fieldName);
//     };

//     // Name field
//     if (isRequired('name')) {
//       schemaFields.name = z.string().min(1, "Name is required");
//     } else {
//       schemaFields.name = z.string().optional();
//     }

//     // Age field
//     if (isRequired('age')) {
//       schemaFields.age = z.coerce.number({ required_error: "Age is required" })
//         .min(0, "Age must be positive")
//         .max(120, "Age seems invalid");
//     } else {
//       schemaFields.age = z.coerce.number().min(0).max(120).optional();
//     }

//     // Height field
//     if (isRequired('height')) {
//       schemaFields.height = z.coerce.number({ required_error: "Height is required" })
//         .min(0, "Height must be positive")
//         .max(300, "Height seems invalid");
//     } else {
//       schemaFields.height = z.coerce.number().min(0).max(300).optional();
//     }

//     // Weight field
//     if (isRequired('weight')) {
//       schemaFields.weight = z.coerce.number({ required_error: "Weight is required" })
//         .min(0, "Weight must be positive")
//         .max(500, "Weight seems invalid");
//     } else {
//       schemaFields.weight = z.coerce.number().min(0).max(500).optional();
//     }

//     // Gender field
//     if (isRequired('gender')) {
//       schemaFields.gender = z.enum(GENDER, {
//         required_error: "Gender is required",
//       });
//     } else {
//       schemaFields.gender = z.enum(GENDER).optional();
//     }

//     return z.object(schemaFields);
//   };

//   const basicQuestionsSchema = createSchema();
//   type BasicQuestionsFormData = z.infer<typeof basicQuestionsSchema>;

//   const { register, handleSubmit, formState: { errors }, control, setValue } = useForm<BasicQuestionsFormData>({
//     resolver: zodResolver(basicQuestionsSchema),
//     mode: "onChange",
//     defaultValues: {
//       name: "",
//       age: undefined,
//       height: undefined,
//       weight: undefined,
//       gender: undefined,
//     }
//   });

//   const onSubmit = async (data: BasicQuestionsFormData) => {
//     // Build submit data with proper types, only including fields that have values
//     const submitData: Partial<BasicQuestionsSubmitData> = {};

//     if (data.name !== undefined && data.name !== "") {
//       submitData.name = data.name as string;
//     }
//     if (data.age !== undefined) {
//       submitData.age = data.age as number;
//     }
//     if (data.height !== undefined) {
//       submitData.height = data.height as number;
//     }
//     if (data.weight !== undefined) {
//       submitData.weight = data.weight as number;
//     }
//     if (data.gender !== undefined) {
//       submitData.gender = data.gender as Gender;
//     }

//     // Ensure all required fields are present for the API
//     const apiData: BasicQuestionsSubmitData = {
//       name: submitData.name || null,
//       age: submitData.age || null,
//       height: submitData.height || null,
//       weight: submitData.weight || null,
//       gender: submitData.gender || null,
//     };

//     postBasicQuestions(apiData);
//   };

//   const handleNext = async () => {
//     handleSubmit(onSubmit)();
//   };

//   // If no missing fields for basic info, show a message
//   if (!hasMissingFields) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
//           <p className="text-sm text-gray-500">Your basic information is already complete!</p>
//         </div>
//         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//           <p className="text-green-800 text-sm">
//             All required basic information has been provided. You can proceed to the next step.
//           </p>
//         </div>
//         <DialogFooter className="gap-2 sm:justify-center">
//           <div className="flex gap-2 w-full">
//             <Button
//               variant="outline"
//               onClick={onPrevious}
//               disabled={isSubmitting}
//               className="w-1/2"
//             >
//               Previous
//             </Button>
//             <Button
//               onClick={onNext}
//               disabled={isSubmitting}
//               className="w-1/2"
//             >
//               Continue
//             </Button>
//           </div>
//         </DialogFooter>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
//         <p className="text-sm text-gray-500">Tell us a bit about yourself to personalise your experience</p>
//       </div>

//       <div className="space-y-4">
//         {basicMissingFields.includes('name') && (
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
//               What is your name?
//             </label>
//             {errors.name && (
//               <p className="mt-1 text-sm text-red-600">{typeof errors.name?.message === 'string' ? errors.name.message : 'Invalid input'}</p>
//             )}
//             <Input
//               {...register("name")}
//               type="text"
//               id="name"
//               className="block w-full"
//               placeholder="Enter your name"
//             />
//           </div>
//         )}

//         {basicMissingFields.includes('age') && (
//           <div>
//             <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
//               What is your age?
//             </label>
//             {errors.age && (
//               <p className="mt-1 text-sm text-red-600">{typeof errors.age?.message === 'string' ? errors.age.message : 'Invalid input'}</p>
//             )}
//             <Input
//               {...register("age", { valueAsNumber: true })}
//               type="number"
//               id="age"
//               className="block w-full"
//               placeholder="Enter your age"
//             />
//           </div>
//         )}

//         {basicMissingFields.includes('height') && (
//           <div>
//             <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
//               What is your height? (cm)
//             </label>
//             {errors.height && (
//               <p className="mt-1 text-sm text-red-600">{typeof errors.height?.message === 'string' ? errors.height.message : 'Invalid input'}</p>
//             )}
//             <Input
//               {...register("height", { valueAsNumber: true })}
//               type="number"
//               id="height"
//               className="block w-full"
//               placeholder="Enter your height in cm"
//             />
//           </div>
//         )}

//         {basicMissingFields.includes('weight') && (
//           <div>
//             <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
//               What is your weight? (kg)
//             </label>
//             {errors.weight && (
//               <p className="mt-1 text-sm text-red-600">{typeof errors.weight?.message === 'string' ? errors.weight.message : 'Invalid input'}</p>
//             )}
//             <Input
//               {...register("weight", { valueAsNumber: true })}
//               type="number"
//               id="weight"
//               className="block w-full"
//               placeholder="Enter your weight in kg"
//             />
//           </div>
//         )}

//         {basicMissingFields.includes('gender') && (
//           <div>
//             <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
//               What is your gender?
//             </label>
//             {errors.gender && (
//               <p className="mt-1 text-sm text-red-600">{typeof errors.gender?.message === 'string' ? errors.gender.message : 'Invalid input'}</p>
//             )}
//             <Controller
//               name="gender"
//               control={control}
//               render={({ field }) => (
//                 <Select
//                   onValueChange={(value: Gender) => field.onChange(value)}
//                   value={field.value || ""}
//                   defaultValue={field.value || ""}
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Select gender" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {GENDER.map((gender) => (
//                       <SelectItem key={gender} value={gender}>{gender}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               )}
//             />
//           </div>
//         )}
//       </div>

//       <DialogFooter className="gap-2 sm:justify-center">
//         <div className="flex gap-2 w-full">
//           <Button
//             variant="outline"
//             onClick={onPrevious}
//             disabled={isSubmitting}
//             className="w-1/2"
//           >
//             Previous
//           </Button>
//           <Button
//             onClick={handleNext}
//             disabled={isSubmitting}
//             className="w-1/2"
//           >
//             {isSubmitting ? "Saving..." : "Save & Continue"}
//           </Button>
//         </div>
//       </DialogFooter>
//     </div>
//   );
// } 