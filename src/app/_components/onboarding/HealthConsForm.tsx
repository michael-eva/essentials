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

interface HealthConsFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

export default function HealthConsForm({ isFirstStep, isLastStep, currentStep }: HealthConsFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // This function will be passed to the FormFooter
    const onSubmit = async (): Promise<boolean> => {
        setIsSubmitting(true);
        
        try {
            // Add your form validation logic here
            
            // Mock form submission
            console.log("Health considerations data submitted");
            
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
                <h2 className="text-2xl font-bold text-gray-900">Health Considerations</h2>
                {/* Add your form fields here */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Do you have any medical conditions we should be aware of?
                        </label>
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center">
                                <input
                                    id="heart-condition"
                                    name="medical-condition"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="heart-condition" className="ml-3 text-sm text-gray-700">
                                    Heart condition
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="diabetes"
                                    name="medical-condition"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="diabetes" className="ml-3 text-sm text-gray-700">
                                    Diabetes
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="asthma"
                                    name="medical-condition"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="asthma" className="ml-3 text-sm text-gray-700">
                                    Asthma
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="joint-pain"
                                    name="medical-condition"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="joint-pain" className="ml-3 text-sm text-gray-700">
                                    Joint pain or issues
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="none"
                                    name="medical-condition"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="none" className="ml-3 text-sm text-gray-700">
                                    None of the above
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="other-conditions" className="block text-sm font-medium text-gray-700">
                            Any other health considerations or injuries?
                        </label>
                        <textarea
                            id="other-conditions"
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Please share any other health considerations we should know about..."
                        />
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