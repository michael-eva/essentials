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

interface FitnessBgFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

export default function FitnessBgForm({ isFirstStep, isLastStep, currentStep }: FitnessBgFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // This function will be passed to the FormFooter
    const onSubmit = async (): Promise<boolean> => {
        setIsSubmitting(true);
        
        try {
            // Add your form validation logic here
            
            // Mock form submission
            console.log("Fitness background data submitted");
            
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
                <h2 className="text-2xl font-bold text-gray-900">Fitness Background</h2>
                {/* Add your form fields here */}
                <div className="space-y-4">
                    {/* Example form fields - replace with your actual fields */}
                    <div>
                        <label htmlFor="activity-level" className="block text-sm font-medium text-gray-700">
                            What is your current activity level?
                        </label>
                        <select
                            id="activity-level"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option>Sedentary</option>
                            <option>Light activity</option>
                            <option>Moderate activity</option>
                            <option>Very active</option>
                            <option>Extremely active</option>
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="exercise-frequency" className="block text-sm font-medium text-gray-700">
                            How often do you exercise?
                        </label>
                        <select
                            id="exercise-frequency"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option>Never</option>
                            <option>1-2 times per week</option>
                            <option>3-4 times per week</option>
                            <option>5+ times per week</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            What types of exercise do you enjoy? (Select all that apply)
                        </label>
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center">
                                <input
                                    id="cardio"
                                    name="exercise-type"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="cardio" className="ml-3 text-sm text-gray-700">
                                    Cardio (running, cycling, etc.)
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="strength"
                                    name="exercise-type"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="strength" className="ml-3 text-sm text-gray-700">
                                    Strength training
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="flexibility"
                                    name="exercise-type"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="flexibility" className="ml-3 text-sm text-gray-700">
                                    Flexibility (yoga, stretching)
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="sports"
                                    name="exercise-type"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="sports" className="ml-3 text-sm text-gray-700">
                                    Sports (tennis, basketball, etc.)
                                </label>
                            </div>
                        </div>
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