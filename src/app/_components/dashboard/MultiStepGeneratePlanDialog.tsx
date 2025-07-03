import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { CheckCircle, Circle } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DEFAULT_EXERCISE_OPTIONS, EXERCISE_FREQUENCY, FITNESS_LEVEL, SESSION_LENGTH } from "@/app/_constants/fitness";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import BasicQuestionsForm from "../complete-profile/forms/BasicQuestions";
import HealthConsiderationsForm from "../complete-profile/forms/HealthConsiderationsForm";
import GoalsFormComplete from "../complete-profile/forms/GoalsForm";
import PilatesFormComplete from "../complete-profile/forms/PilatesForm";
import MotivationFormComplete from "../complete-profile/forms/MotivationForm";
import WorkoutTimingFormComplete from "../complete-profile/forms/WorkoutTimingForm";
import GeneratePlanForm from "./GeneratePlanDialog";
import { STEPS } from "@/app/onboarding/constants";
import FitnessBackgroundForm from "../complete-profile/forms/FitnessBg";

interface PlanPreferences {
  workoutDuration: number;
  classDuration: number;
  workoutClassRatio: number;
  activitiesPerWeek: number;
  additionalNotes: string;
}

interface MultiStepGeneratePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (preferences: PlanPreferences) => void;
  isLoading: boolean;
}

type OnboardingStep = (typeof STEPS)[number] | 'plan-generation';

// Define field groups with proper typing - EXPORTED for use in form components
export const FIELD_GROUPS = {
  basicInfo: ['name', 'age', 'weight', 'gender', 'height'] as const,
  fitnessBackground: ['fitnessLevel', 'exercises', 'exerciseFrequency', 'sessionLength'] as const,
  healthConsiderations: ['injuries', 'recentSurgery', 'chronicConditions', 'pregnancy', 'injuriesDetails', 'surgeryDetails', 'otherHealthConditions', 'pregnancyConsultedDoctor', 'pregnancyConsultedDoctorDetails'] as const,
  goals: ['fitnessGoals', 'goalTimeline'] as const,
  pilates: ['pilatesExperience', 'studioFrequency', 'sessionPreference', 'apparatusPreference', 'pilatesDuration', 'customApparatus'] as const,
  motivation: ['motivation', 'progressTracking'] as const,
  workoutTiming: ['preferredWorkoutTimes', 'avoidedWorkoutTimes', 'weekendWorkoutTimes'] as const,
} as const;

// New type for grouped missing fields
export type MissingFieldsGrouped = {
  basic?: string[];
  fitness?: string[];
  health?: string[];
  goals?: string[];
  pilates?: string[];
  motivation?: string[];
  timing?: string[];
};

// Export types for use in form components
export type BasicInfoField = typeof FIELD_GROUPS.basicInfo[number];
export type FitnessBackgroundField = typeof FIELD_GROUPS.fitnessBackground[number];
export type HealthConsiderationsField = typeof FIELD_GROUPS.healthConsiderations[number];
export type GoalsField = typeof FIELD_GROUPS.goals[number];
export type PilatesField = typeof FIELD_GROUPS.pilates[number];
export type MotivationField = typeof FIELD_GROUPS.motivation[number];
export type WorkoutTimingField = typeof FIELD_GROUPS.workoutTiming[number];

export default function MultiStepGeneratePlanDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading
}: MultiStepGeneratePlanDialogProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);

  // Check onboarding completion status
  const { data: onboardingResult, isLoading: isLoadingOnboarding } = api.onboarding.checkOnboardingCompletion.useQuery(undefined, {
    enabled: open,
  });

  // Determine which onboarding steps are needed
  useEffect(() => {
    if (isLoadingOnboarding) return;

    const steps: OnboardingStep[] = [];

    // If onboarding is complete, only show plan generation
    if (onboardingResult === true) {
      steps.push('plan-generation');
    }
    // If onboarding is not complete, determine which steps are needed
    else if (onboardingResult && typeof onboardingResult === 'object' && 'missingFields' in onboardingResult) {
      const missingFields = onboardingResult.missingFields as MissingFieldsGrouped;

      // Dynamically add steps in the order defined in onboarding constants
      STEPS.forEach(step => {
        const stepFieldMap = {
          'basic-info': missingFields.basic,
          'fitness-background': missingFields.fitness,
          'health-considerations': missingFields.health,
          'goals': missingFields.goals,
          'pilates': missingFields.pilates,
          'motivation': missingFields.motivation,
          'workout-timing': missingFields.timing,
        };

        const stepFields = stepFieldMap[step];
        if (stepFields && stepFields.length > 0) {
          steps.push(step);
        }
      });

      // Always add plan generation as the final step
      steps.push('plan-generation');
    }

    setOnboardingSteps(steps);
    setCurrentStepIndex(0);
  }, [onboardingResult, isLoadingOnboarding]);

  const currentStep = onboardingSteps[currentStepIndex];
  const isPlanGenerationStep = currentStep === 'plan-generation';
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === onboardingSteps.length - 1;

  const handleNext = () => {
    setCurrentStepIndex(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStepIndex === 0) {
      onOpenChange(false);
      return;
    }
    setCurrentStepIndex(prev => prev - 1);
  };

  const handleClose = () => {
    setCurrentStepIndex(0);
    onOpenChange(false);
  };

  const renderCurrentStep = () => {
    if (isLoadingOnboarding || !currentStep) {
      return <div className="flex items-center justify-center p-8">Loading...</div>;
    }

    switch (currentStep) {
      case 'basic-info':
        return (
          <BasicQuestionsForm
            missingFields={onboardingResult && typeof onboardingResult === 'object' && 'missingFields' in onboardingResult
              ? onboardingResult.missingFields as MissingFieldsGrouped
              : undefined
            }
            isSubmitting={isSubmittingStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'fitness-background':
        return (
          <FitnessBackgroundForm
            missingFields={onboardingResult && typeof onboardingResult === 'object' && 'missingFields' in onboardingResult
              ? onboardingResult.missingFields as MissingFieldsGrouped
              : undefined
            }
            isSubmitting={isSubmittingStep}
            onNext={() => setCurrentStepIndex(prev => prev + 1)}
            onPrevious={handlePrevious}
          />
        );
      case 'health-considerations':
        return (
          <HealthConsiderationsForm
            missingFields={onboardingResult && typeof onboardingResult === 'object' && 'missingFields' in onboardingResult
              ? onboardingResult.missingFields as MissingFieldsGrouped
              : undefined
            }
            isSubmitting={isSubmittingStep}
            onNext={() => setCurrentStepIndex(prev => prev + 1)}
            onPrevious={handlePrevious}
          />
        );
      case 'goals':
        return (
          <GoalsFormComplete
            missingFields={onboardingResult && typeof onboardingResult === 'object' && 'missingFields' in onboardingResult
              ? onboardingResult.missingFields as MissingFieldsGrouped
              : undefined
            }
            isSubmitting={isSubmittingStep}
            onNext={() => setCurrentStepIndex(prev => prev + 1)}
            onPrevious={handlePrevious}
          />
        );
      case 'pilates':
        return (
          <PilatesFormComplete
            missingFields={onboardingResult && typeof onboardingResult === 'object' && 'missingFields' in onboardingResult
              ? onboardingResult.missingFields as MissingFieldsGrouped
              : undefined
            }
            isSubmitting={isSubmittingStep}
            onNext={() => setCurrentStepIndex(prev => prev + 1)}
            onPrevious={handlePrevious}
          />
        );
      case 'motivation':
        return (
          <MotivationFormComplete
            missingFields={onboardingResult && typeof onboardingResult === 'object' && 'missingFields' in onboardingResult
              ? onboardingResult.missingFields as MissingFieldsGrouped
              : undefined
            }
            isSubmitting={isSubmittingStep}
            onNext={() => setCurrentStepIndex(prev => prev + 1)}
            onPrevious={handlePrevious}
          />
        );
      // case 'workout-timing':
      //   return (
      //     <WorkoutTimingFormComplete
      //       missingFields={onboardingResult && typeof onboardingResult === 'object' && 'missingFields' in onboardingResult
      //         ? onboardingResult.missingFields as MissingFieldsGrouped
      //         : undefined
      //       }
      //       isSubmitting={isSubmittingStep}
      //       onNext={() => setCurrentStepIndex(prev => prev + 1)}
      //       onPrevious={handlePrevious}
      //     />
      //   );
      case 'plan-generation':
        return (
          <GeneratePlanForm
            isSubmitting={isLoading}
            onNext={onConfirm}
            onPrevious={handlePrevious}
          />
        );
      default:
        return <div>Invalid step</div>;
    }
  };


  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Generate Your Workout Plan
          </DialogTitle>
          <div className="text-sm text-gray-500">Before we generate your plan, we just need to ask you a few questions:</div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          {renderCurrentStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
} 