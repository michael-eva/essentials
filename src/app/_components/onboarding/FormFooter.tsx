import { useRouter } from "next/navigation";
import { useState } from "react";
import { STEPS } from "@/app/onboarding/[tab]/page";
import { isValid } from "zod";

export interface FormFooterProps {
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
                // router.push('/dashboard');
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
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center">
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={isFirstStep || loading}
                    className={`px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all ${isFirstStep ? 'invisible' : ''
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Previous
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className={`px-6 py-3 text-sm font-medium text-white bg-primary border border-transparent rounded-full hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {loading ? 'Processing...' : isLastStep ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    );
}