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

interface MotivationFormProps {
    isFirstStep?: boolean;
    isLastStep?: boolean;
    currentStep: typeof STEPS[number];
}

export default function MotivationForm({ isFirstStep, isLastStep, currentStep }: MotivationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // This function will be passed to the FormFooter
    const onSubmit = async (): Promise<boolean> => {
        setIsSubmitting(true);
        
        try {
            // Add your form validation logic here
            
            // Mock form submission
            console.log("Motivation data submitted");
            
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
                <h2 className="text-2xl font-bold text-gray-900">Motivation & Commitment</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="motivation" className="block text-sm font-medium text-gray-700">
                            What motivates you to improve your fitness?
                        </label>
                        <textarea
                            id="motivation"
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Tell us what drives you..."
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="challenges" className="block text-sm font-medium text-gray-700">
                            What challenges do you anticipate in sticking to your program?
                        </label>
                        <textarea
                            id="challenges"
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="E.g., Time constraints, motivation, etc."
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="commitment-level" className="block text-sm font-medium text-gray-700">
                            How would you rate your commitment level?
                        </label>
                        <select
                            id="commitment-level"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option>Very committed - I'll make this a priority</option>
                            <option>Moderately committed - I'll try my best</option>
                            <option>Somewhat committed - I may struggle with consistency</option>
                            <option>Not sure yet - I need to see how it fits into my life</option>
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="accountability" className="block text-sm font-medium text-gray-700">
                            What helps you stay accountable to your goals?
                        </label>
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center">
                                <input
                                    id="tracking-progress"
                                    name="accountability"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="tracking-progress" className="ml-3 text-sm text-gray-700">
                                    Tracking my progress
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="workout-buddy"
                                    name="accountability"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="workout-buddy" className="ml-3 text-sm text-gray-700">
                                    Having a workout buddy
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="instructor"
                                    name="accountability"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="instructor" className="ml-3 text-sm text-gray-700">
                                    Working with an instructor
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="reminders"
                                    name="accountability"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="reminders" className="ml-3 text-sm text-gray-700">
                                    Setting reminders/calendar events
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