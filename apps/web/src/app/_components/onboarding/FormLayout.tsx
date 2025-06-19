import FormFooter, { type FormFooterProps } from "./FormFooter";
import { STEPS } from "@/app/onboarding/constants";

function FormProgress({ currentStep }: { currentStep: typeof STEPS[number] }) {
    const currentIndex = STEPS.indexOf(currentStep);
    const totalSteps = STEPS.length;
    const progress = ((currentIndex + 1) / totalSteps) * 100;

    return (
        <div className="px-8 pt-8 pb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Step {currentIndex + 1} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                    className="bg-black h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

export default function FormLayout({ children, ...props }: FormFooterProps & { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:py-16">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                <FormProgress currentStep={props.currentStep} />
                <div className="px-2 py-6 space-y-8 flex-grow">
                    {children}
                </div>
                <FormFooter
                    onSubmit={props.onSubmit}
                    isFirstStep={props.isFirstStep}
                    isLastStep={props.isLastStep}
                    currentStep={props.currentStep}
                    isSubmitting={props.isSubmitting}
                />
            </div>
        </div>
    );
}
