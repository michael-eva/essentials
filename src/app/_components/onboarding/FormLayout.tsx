import FormFooter, { type FormFooterProps } from "./FormFooter";
import { STEPS } from "@/app/onboarding/constants";

function FormProgress({
  currentStep,
}: {
  currentStep: (typeof STEPS)[number];
}) {
  const currentIndex = STEPS.indexOf(currentStep);
  const totalSteps = STEPS.length;
  const progress = ((currentIndex + 1) / totalSteps) * 100;

  return (
    <div className="px-8 pt-8 pb-4">
      <div className="mb-2 flex justify-between text-xs text-gray-500">
        <span>
          Step {currentIndex + 1} of {totalSteps}
        </span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            progress === 100 ? "bg-brand-deep-blue" : "bg-brand-amber"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function FormLayout({
  children,
  ...props
}: FormFooterProps & { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:py-16">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
        <FormProgress currentStep={props.currentStep} />
        <div className="flex-grow space-y-8 px-2 py-6">{children}</div>
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
