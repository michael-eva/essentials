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
import HealthConsForm from "@/app/_components/onboarding/HealthConsForm";
import HealthConsiderationsForm from "../complete-profile/forms/HealthConsiderationsForm";
import GoalsForm from "@/app/_components/onboarding/GoalsForm";
import GoalsFormComplete from "../complete-profile/forms/GoalsForm";
import PilatesForm from "@/app/_components/onboarding/PilatesForm";
import PilatesFormComplete from "../complete-profile/forms/PilatesForm";
import MotivationForm from "@/app/_components/onboarding/MotivationForm";
import WorkoutTimingForm from "@/app/_components/onboarding/WorkoutTimingForm";
import GeneratePlanDialog from "./GeneratePlanDialog";
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
      const missingFields = onboardingResult.missingFields;

      // Dynamically add steps in the order defined in onboarding constants
      STEPS.forEach(step => {
        const fieldGroupMap = {
          'basic-info': FIELD_GROUPS.basicInfo,
          'fitness-background': FIELD_GROUPS.fitnessBackground,
          'health-considerations': FIELD_GROUPS.healthConsiderations,
          'goals': FIELD_GROUPS.goals,
          'pilates': FIELD_GROUPS.pilates,
          'motivation': FIELD_GROUPS.motivation,
          'workout-timing': FIELD_GROUPS.workoutTiming,
        };

        const fieldGroup = fieldGroupMap[step];
        if (fieldGroup && fieldGroup.some(field => missingFields.includes(field))) {
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
              ? onboardingResult.missingFields.filter(field => FIELD_GROUPS.basicInfo.includes(field as BasicInfoField)) as BasicInfoField[]
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
              ? onboardingResult.missingFields.filter(field => FIELD_GROUPS.fitnessBackground.includes(field as any)) as FitnessBackgroundField[]
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
              ? onboardingResult.missingFields.filter(field => FIELD_GROUPS.healthConsiderations.includes(field as any)) as HealthConsiderationsField[]
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
              ? onboardingResult.missingFields.filter(field => FIELD_GROUPS.goals.includes(field as any)) as GoalsField[]
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
              ? onboardingResult.missingFields.filter(field => FIELD_GROUPS.pilates.includes(field as any)) as PilatesField[]
              : undefined
            }
            isSubmitting={isSubmittingStep}
            onNext={() => setCurrentStepIndex(prev => prev + 1)}
            onPrevious={handlePrevious}
          />
        );
      case 'motivation':
        return (
          <MotivationForm
            isFirstStep={currentStepIndex === 0}
            isLastStep={currentStepIndex === onboardingSteps.length - 1}
            currentStep={currentStep}
          />
        );
      case 'workout-timing':
        return (
          <WorkoutTimingForm
            isFirstStep={currentStepIndex === 0}
            isLastStep={currentStepIndex === onboardingSteps.length - 1}
            currentStep={currentStep}
          />
        );
      case 'plan-generation':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Customize Your Workout Plan</h3>
              <p className="text-sm text-gray-500">Set your preferences for the generated plan</p>
            </div>
            <GeneratePlanDialog
              open={true}
              onOpenChange={() => { }} // This is controlled by the parent
              onConfirm={onConfirm}
              isLoading={isLoading}
            />
          </div>
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  const getStepTitle = (step: OnboardingStep) => {
    switch (step) {
      case 'basic-info': return 'Basic Information';
      case 'fitness-background': return 'Fitness Background';
      case 'health-considerations': return 'Health Considerations';
      case 'goals': return 'Goals & Timeline';
      case 'pilates': return 'Pilates Experience';
      case 'motivation': return 'Motivation';
      case 'workout-timing': return 'Workout Timing';
      case 'plan-generation': return 'Plan Preferences';
      default: return 'Unknown Step';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {isPlanGenerationStep ? 'Generate Your Workout Plan' : 'Complete Your Profile'}
          </DialogTitle>

          {/* Progress indicator */}
          {onboardingSteps.length > 1 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step {currentStepIndex + 1} of {onboardingSteps.length}</span>
                <span>{getStepTitle(currentStep!)}</span>
              </div>
              <div className="flex space-x-2">
                {onboardingSteps.map((step, index) => (
                  <div key={step} className="flex items-center">
                    {index < currentStepIndex ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : index === currentStepIndex ? (
                      <Circle className="w-5 h-5 text-blue-500 fill-current" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                    {index < onboardingSteps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-1 ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          {renderCurrentStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
} 