import { useRouter } from "next/navigation";
import { useState } from "react";

const STEPS = [
    "basic-info",
    "fitness-background",
    "health-considerations",
    "goals",
    "pilates",
    "motivation"
] as const;

interface FormFooterProps {
    onSubmit: () => Promise<boolean>; // Should return true if validation passed, false otherwise
    isLastStep?: boolean;
    isFirstStep?: boolean;
    currentStep: typeof STEPS[number];
    isSubmitting?: boolean; // Optional prop to show loading state
}

export default function FormFooter({ 
    onSubmit, 
    isLastStep, 
    isFirstStep, 
    currentStep,
    isSubmitting = false
}: FormFooterProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(isSubmitting);

    const handleNext = async () => {
        setLoading(true);
        try {
            // Call the form's submit function
            const isValid = await onSubmit();
            
            // Only navigate if validation passed
            if (isValid && !isLastStep) {
                const currentIndex = STEPS.indexOf(currentStep);
                const nextStep = STEPS[currentIndex + 1];
                router.push(`/onboarding/${nextStep}`);
            } else if (isValid && isLastStep) {
                // Handle completion of the entire onboarding process
                router.push('/dashboard'); // or wherever you want to redirect after completion
            }
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevious = () => {
        if (!isFirstStep) {
            const currentIndex = STEPS.indexOf(currentStep);
            const previousStep = STEPS[currentIndex - 1];
            router.push(`/onboarding/${previousStep}`);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="max-w-md mx-auto flex justify-between items-center">
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={isFirstStep || loading}
                    className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        isFirstStep ? 'invisible' : ''
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Previous
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? 'Processing...' : isLastStep ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    );
}