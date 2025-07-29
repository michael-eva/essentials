import { useMemo } from "react"
import { api } from "@/trpc/react"
import { User, Dumbbell, Target, Heart, Sparkles, Activity } from "lucide-react"

import type { Gender } from "@/app/_constants/gender";
import type { GoalTimeline } from "@/app/_constants/goals";
import { SECTION_LABELS } from "@/app/_constants/ui-labels";
import type { HealthCondition, PregnancyOption } from "@/app/_constants/health";
import type { MotivationFactor, ProgressTrackingMethod } from "@/app/_constants/motivation";
import type { ExerciseFrequency, FitnessLevel, SessionLength } from "@/app/_constants/fitness";
import type { PilatesApparatus, PilatesDuration, PilatesSessionPreference, PilatesStyles } from "@/app/_constants/pilates";

import type { PilatesSessions } from "@/app/_constants/pilates";

// Form data interface with proper optional types
export interface FormData {
  healthCons: {
    injuries: boolean | null;
    injuriesDetails: string | null;
    recentSurgery: boolean | null;
    surgeryDetails: string | null;
    chronicConditions: string[];
    otherHealthConditions: string[];
    pregnancy: PregnancyOption | null;
    pregnancyConsultedDoctor: boolean | null;
    pregnancyConsultedDoctorDetails: string | null;
  };
  motivation: {
    motivation: MotivationFactor[];
    progressTracking: ProgressTrackingMethod[];
    otherMotivation: string[];
    otherProgressTracking: string[];
  };
  pilates: {
    fitnessLevel: FitnessLevel | null;
    pilatesExperience: boolean | null;
    pilatesDuration: PilatesDuration | null;
    pilatesStyles: PilatesStyles[];
    homeEquipment: PilatesApparatus[];
    fitnessGoals: string[];
    otherFitnessGoals: string[];
    specificGoals: string | null;
  };
}

export type FormType = keyof FormData

export interface FormSection {
  type: FormType;
  title: string;
  description: string;
  icon: React.ReactNode;
  completion: number;
  color: string;
}

export function useProfileCompletion() {
  const { data: onboardingData, isLoading } = api.onboarding.getOnboardingData.useQuery()

  const formData: FormData | null = useMemo(() => {
    if (!onboardingData) return null

    return {
      healthCons: {
        injuries: onboardingData.injuries ?? null,
        injuriesDetails: onboardingData.injuriesDetails,
        recentSurgery: onboardingData.recentSurgery ?? null,
        surgeryDetails: onboardingData.surgeryDetails,
        chronicConditions: onboardingData.chronicConditions ?? [],
        otherHealthConditions: onboardingData.otherHealthConditions ?? [],
        pregnancy: onboardingData.pregnancy as PregnancyOption | null,
        pregnancyConsultedDoctor: onboardingData.pregnancyConsultedDoctor ?? null,
        pregnancyConsultedDoctorDetails: onboardingData.pregnancyConsultedDoctorDetails ?? null
      },
      pilates: {
        fitnessLevel: onboardingData.fitnessLevel as FitnessLevel | null,
        pilatesExperience: onboardingData.pilatesExperience ?? null,
        pilatesDuration: onboardingData.pilatesDuration as PilatesDuration | null,
        pilatesStyles: (onboardingData.pilatesStyles ?? []) as PilatesStyles[],
        homeEquipment: (onboardingData.homeEquipment ?? []) as PilatesApparatus[],
        fitnessGoals: onboardingData.fitnessGoals ?? [],
        otherFitnessGoals: onboardingData.otherFitnessGoals ?? [],
        specificGoals: onboardingData.specificGoals ?? null
      },
      motivation: {
        motivation: onboardingData.motivation ?? [],
        otherMotivation: onboardingData.otherMotivation ?? [],
        progressTracking: onboardingData.progressTracking ?? [],
        otherProgressTracking: onboardingData.otherProgressTracking ?? []
      }
    }
  }, [onboardingData])

  const calculateCompletion = (formType: FormType): number => {
    if (!formData) return 0
    const section = formData[formType]
    if (!section) return 0

    let totalFields = 0
    let filledFields = 0

    switch (formType) {
      case "healthCons": {
        const data = section as FormData["healthCons"]
        totalFields = 4 + (data.chronicConditions.includes("Other") ? 1 : 0) + (data.injuries ? 1 : 0) + (data.recentSurgery ? 1 : 0) + (data.pregnancyConsultedDoctor ? 1 : 0) + (data.pregnancyConsultedDoctorDetails !== null ? 1 : 0)
        filledFields = [
          data.injuries !== null,
          data.recentSurgery !== null,
          data.chronicConditions.length > 0,
          data.pregnancy,
          data.injuriesDetails,
          data.surgeryDetails,
          data.chronicConditions.includes("Other") ? data.otherHealthConditions.length > 0 : null,
          data.pregnancyConsultedDoctor !== null,
          data.pregnancyConsultedDoctorDetails !== null
        ].filter(Boolean).length
        break
      }
      case "motivation": {
        const data = section as FormData["motivation"]
        totalFields = 2 + (data.motivation.includes("Other") ? 1 : 0) + (data.progressTracking.includes("Other") ? 1 : 0)
        filledFields = [
          data.motivation.length > 0,
          data.progressTracking.length > 0,
          data.motivation.includes("Other") ? data.otherMotivation.length > 0 : null,
          data.progressTracking.includes("Other") ? data.otherProgressTracking.length > 0 : null
        ].filter(Boolean).length
        break
      }
      case "pilates": {
        const data = section as FormData["pilates"]
        totalFields = 5 + (data.pilatesExperience ? 1 : 0) + (data.fitnessGoals.includes("Other") ? 1 : 0) + (data.specificGoals !== null ? 1 : 0)
        filledFields = [
          data.pilatesExperience !== null,
          data.pilatesExperience ? data.pilatesDuration !== null : null,
          data.pilatesStyles.length > 0,
          data.fitnessGoals.length > 0,
          data.specificGoals !== null,
          data.otherFitnessGoals.length > 0,
          data.homeEquipment.length > 0,
          data.pilatesStyles.length > 0,
        ].filter(Boolean).length
        break
      }
    }

    return Math.round((filledFields / totalFields) * 100)
  }

  const formSections = useMemo(() => [

    {
      type: "pilates" as FormType,
      title: SECTION_LABELS.PILATES.TITLE,
      description: SECTION_LABELS.PILATES.DESCRIPTION,
      icon: <Activity className="w-5 h-5" />,
      completion: calculateCompletion("pilates"),
      color: SECTION_LABELS.PILATES.COLOR
    },
    {
      type: "healthCons" as FormType,
      title: SECTION_LABELS.HEALTH_CONS.TITLE,
      description: SECTION_LABELS.HEALTH_CONS.DESCRIPTION,
      icon: <Heart className="w-5 h-5" />,
      completion: calculateCompletion("healthCons"),
      color: SECTION_LABELS.HEALTH_CONS.COLOR
    },
    {
      type: "motivation" as FormType,
      title: SECTION_LABELS.MOTIVATION.TITLE,
      description: SECTION_LABELS.MOTIVATION.DESCRIPTION,
      icon: <Sparkles className="w-5 h-5" />,
      completion: calculateCompletion("motivation"),
      color: SECTION_LABELS.MOTIVATION.COLOR
    },
  ], [calculateCompletion, formData]) as FormSection[]

  const totalCompletion = useMemo(() => {
    if (!formData) return 0
    const totalCompletion = formSections.reduce((sum, section) => sum + section.completion, 0)
    return Math.round(totalCompletion / formSections.length)
  }, [formSections])

  return {
    isLoading,
    formData,
    formSections,
    totalCompletion,
    calculateCompletion
  }
}
