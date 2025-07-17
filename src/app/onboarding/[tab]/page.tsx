'use client'
import BasicQuestionForm from "@/app/_components/onboarding/BasicQuestionForm";
import FitnessBgForm from "@/app/_components/onboarding/FitnessBgForm";
import HealthConsForm from "@/app/_components/onboarding/HealthConsForm";
import GoalsForm from "@/app/_components/onboarding/GoalsForm";
import { use } from "react";
import MotivationForm from "@/app/_components/onboarding/MotivationForm";
import PilatesForm from "@/app/_components/onboarding/PilatesForm";
import { STEPS } from "../constants";
// import WorkoutTimingForm from "@/app/_components/onboarding/WorkoutTimingForm";
type PageProps = {
    params: Promise<{
        tab: string;
    }>;
}
export default function OnboardingPage({ params }: PageProps) {
    const { tab } = use(params);

    const renderForm = () => {
        const currentStepIndex = STEPS.indexOf(tab as typeof STEPS[number]);
        const isFirstStep = currentStepIndex === 0;
        const isLastStep = currentStepIndex === STEPS.length - 1;

        switch (tab) {
            // case "basic-info":
            //     return (
            //         <BasicQuestionForm
            //             isFirstStep={isFirstStep}
            //             isLastStep={isLastStep}
            //             currentStep={tab}
            //         />
            //     );
            // case "fitness-background":
            //     return <FitnessBgForm isFirstStep={isFirstStep} isLastStep={isLastStep} currentStep={tab} />;
            case "health-considerations":
                return <HealthConsForm isFirstStep={isFirstStep} isLastStep={isLastStep} currentStep={tab} />;
            // case "goals":
            //     return <GoalsForm isFirstStep={isFirstStep} isLastStep={isLastStep} currentStep={tab} />;
            case "pilates":
                return <PilatesForm isFirstStep={isFirstStep} isLastStep={isLastStep} currentStep={tab} />;
            case "motivation":
                return <MotivationForm isFirstStep={isFirstStep} isLastStep={isLastStep} currentStep={tab} />;
            // case "workout-timing":
            //     return <WorkoutTimingForm isFirstStep={isFirstStep} isLastStep={isLastStep} currentStep={tab} />;
            default:
                return <div>
                    <p>Invalid tab</p>
                </div>
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {renderForm()}
        </div>
    )
}