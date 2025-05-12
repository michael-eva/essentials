import { useRouter } from "next/navigation";
import { useState } from "react";
import { STEPS } from "@/app/onboarding/constants";
import { Button } from "@/components/ui/button";

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
                <Button
                    type="button"
                    onClick={handlePrevious}
                    disabled={isFirstStep ?? loading}
                    className={`bg-muted text-muted-foreground rounded-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Previous
                </Button>
                <Button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className={`rounded-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Processing...' : isLastStep ? 'Finish' : 'Next'}
                </Button>
            </div>
        </div>
    );
}