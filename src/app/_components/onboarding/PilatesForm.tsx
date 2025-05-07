import { useState } from "react";
import FormFooter from "./FormFooter";

const STEPS = [
    "basic-info",
    "fitness-background",
    "health-considerations",
    "goals",
    "pilates",
    "motivation"
] as const;

interface PilatesFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

export default function PilatesForm({ isFirstStep, isLastStep, currentStep }: PilatesFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // This function will be passed to the FormFooter
    const onSubmit = async (): Promise<boolean> => {
        setIsSubmitting(true);
        
        try {
            // Add your form validation logic here
            
            // Mock form submission
            console.log("Pilates experience data submitted");
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Return true to indicate the form was successfully submitted
            return true;
        } catch (error) {
            console.error("Form submission failed:", error);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pb-20">
            <div className="space-y-6 max-w-md mx-auto p-6">
                <h2 className="text-2xl font-bold text-gray-900">Pilates Experience</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="pilates-experience" className="block text-sm font-medium text-gray-700">
                            What is your experience level with Pilates?
                        </label>
                        <select
                            id="pilates-experience"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option>Complete beginner</option>
                            <option>Some experience</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Have you practiced any of these Pilates methods? (Select all that apply)
                        </label>
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center">
                                <input
                                    id="mat-pilates"
                                    name="pilates-method"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="mat-pilates" className="ml-3 text-sm text-gray-700">
                                    Mat Pilates
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="reformer"
                                    name="pilates-method"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="reformer" className="ml-3 text-sm text-gray-700">
                                    Reformer Pilates
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="clinical"
                                    name="pilates-method"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="clinical" className="ml-3 text-sm text-gray-700">
                                    Clinical Pilates
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="none"
                                    name="pilates-method"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="none" className="ml-3 text-sm text-gray-700">
                                    None
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="pilates-frequency" className="block text-sm font-medium text-gray-700">
                            How often would you like to practice Pilates?
                        </label>
                        <select
                            id="pilates-frequency"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option>1-2 times per week</option>
                            <option>3-4 times per week</option>
                            <option>5+ times per week</option>
                            <option>Not sure yet</option>
                        </select>
                    </div>
                </div>
            </div>
            
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