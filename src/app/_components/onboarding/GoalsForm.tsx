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

interface GoalsFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

export default function GoalsForm({ isFirstStep, isLastStep, currentStep }: GoalsFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // This function will be passed to the FormFooter
    const onSubmit = async (): Promise<boolean> => {
        setIsSubmitting(true);
        
        try {
            // Add your form validation logic here
            
            // Mock form submission
            console.log("Goals data submitted");
            
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
                <h2 className="text-2xl font-bold text-gray-900">Your Fitness Goals</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            What are your primary fitness goals? (Select all that apply)
                        </label>
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center">
                                <input
                                    id="weight-loss"
                                    name="fitness-goal"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="weight-loss" className="ml-3 text-sm text-gray-700">
                                    Weight loss
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="muscle-gain"
                                    name="fitness-goal"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="muscle-gain" className="ml-3 text-sm text-gray-700">
                                    Muscle gain
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="endurance"
                                    name="fitness-goal"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="endurance" className="ml-3 text-sm text-gray-700">
                                    Improve endurance
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="flexibility"
                                    name="fitness-goal"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="flexibility" className="ml-3 text-sm text-gray-700">
                                    Increase flexibility
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="tone"
                                    name="fitness-goal"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="tone" className="ml-3 text-sm text-gray-700">
                                    Tone muscles
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="goal-timeline" className="block text-sm font-medium text-gray-700">
                            What is your timeline for achieving these goals?
                        </label>
                        <select
                            id="goal-timeline"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option>1-3 months</option>
                            <option>3-6 months</option>
                            <option>6-12 months</option>
                            <option>More than a year</option>
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="specific-goals" className="block text-sm font-medium text-gray-700">
                            Do you have any specific goals or milestones?
                        </label>
                        <textarea
                            id="specific-goals"
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="E.g., Run 5k, Lose 10kg, etc."
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