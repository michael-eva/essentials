import { useMemo } from "react"
import { api } from "@/trpc/react"
import { User, Dumbbell, Target, Heart, Sparkles, Activity } from "lucide-react"

import type { Gender } from "@/app/_constants/gender";
import type { GoalTimeline } from "@/app/_constants/goals";
import { SECTION_LABELS } from "@/app/_constants/ui-labels";
import type { HealthCondition, PregnancyOption } from "@/app/_constants/health";
import type { MotivationFactor, ProgressTrackingMethod } from "@/app/_constants/motivation";
import type { ExerciseFrequency, FitnessLevel, SessionLength } from "@/app/_constants/fitness";
import type { PilatesDuration, PilatesSessionPreference } from "@/app/_constants/pilates";

import type { PilatesSessions } from "@/app/_constants/pilates";

// Form data interface with proper optional types
export interface FormData {
  basicQuestion: {
    name: string | null;
    age: number | null;
    height: number | null;
    weight: number | null;
    gender: Gender | null;
  };
  fitnessBg: {
    fitnessLevel: FitnessLevel | null;
    exercises: string[];
    exerciseFrequency: ExerciseFrequency | null;
    sessionLength: SessionLength | null;
    customExercise: string | null;
  };
  goals: {
    fitnessGoals: string[];
    goalTimeline: GoalTimeline | null;
    specificGoals: string | null;
  };
  healthCons: {
    injuries: boolean | null;
    injuriesDetails: string | null;
    recentSurgery: boolean | null;
    surgeryDetails: string | null;
    chronicConditions: HealthCondition[];
    otherHealthConditions: string[];
    pregnancy: PregnancyOption | null;
    pregnancyConsultedDoctor: boolean | null,
    pregnancyConsultedDoctorDetails: string | null,
  };
  motivation: {
    motivation: MotivationFactor[];
    progressTracking: ProgressTrackingMethod[];
    otherMotivation: string[];
    otherProgressTracking: string[];
  };
  pilates: {
    pilatesExperience: boolean | null;
    pilatesDuration: PilatesDuration | null;
    studioFrequency: PilatesSessions | null;
    sessionPreference: PilatesSessionPreference | null;
    apparatusPreference: string[];
    customApparatus: string[];
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
      basicQuestion: {
        name: onboardingData.name,
        age: onboardingData.age,
        height: onboardingData.height,
        weight: onboardingData.weight,
        gender: onboardingData.gender as Gender | null
      },
      fitnessBg: {
        fitnessLevel: onboardingData.fitnessLevel as FitnessLevel | null,
        exercises: onboardingData.exercises ?? [],
        exerciseFrequency: onboardingData.exerciseFrequency as ExerciseFrequency | null,
        sessionLength: onboardingData.sessionLength as SessionLength | null,
        customExercise: onboardingData.otherExercises?.[0] ?? null
      },
      goals: {
        fitnessGoals: onboardingData.fitnessGoals ?? [],
        goalTimeline: onboardingData.goalTimeline as GoalTimeline | null,
        specificGoals: onboardingData.specificGoals
      },
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
        pilatesExperience: onboardingData.pilatesExperience ?? null,
        pilatesDuration: onboardingData.pilatesDuration as PilatesDuration | null,
        studioFrequency: onboardingData.studioFrequency as PilatesSessions | null,
        sessionPreference: onboardingData.sessionPreference as PilatesSessionPreference,
        apparatusPreference: onboardingData.apparatusPreference ?? [],
        customApparatus: onboardingData.customApparatus ?? []
      },
      motivation: {
        motivation: onboardingData.motivation ?? [],
        progressTracking: onboardingData.progressTracking ?? [],
        otherMotivation: onboardingData.otherMotivation ?? [],
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
      case "basicQuestion": {
        const data = section as FormData["basicQuestion"]
        totalFields = 5
        filledFields = [
          data.name,
          data.age,
          data.height,
          data.weight,
          data.gender
        ].filter(value => value !== null).length
        break
      }
      case "fitnessBg": {
        const data = section as FormData["fitnessBg"]
        totalFields = 4 + (data.exercises.includes("Other") ? 1 : 0)
        filledFields = [
          data.fitnessLevel,
          data.exercises.length > 0,
          data.exerciseFrequency,
          data.sessionLength,
          data.exercises.includes("Other") ? data.customExercise !== null : null
        ].filter(Boolean).length
        break
      }
      case "goals": {
        const data = section as FormData["goals"]
        totalFields = 3
        filledFields = [
          data.fitnessGoals.length > 0,
          data.goalTimeline,
          data.specificGoals
        ].filter(Boolean).length
        break
      }
      case "healthCons": {
        const data = section as FormData["healthCons"]
        totalFields = 4 + (data.chronicConditions.includes("Other") ? 1 : 0) + (data.injuries ? 1 : 0) + (data.recentSurgery ? 1 : 0)
        filledFields = [
          data.injuries !== null,
          data.recentSurgery !== null,
          data.chronicConditions.length > 0,
          data.pregnancy,
          data.injuriesDetails,
          data.surgeryDetails,
          data.chronicConditions.includes("Other") ? data.otherHealthConditions.length > 0 : null
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
        totalFields = 4 + (data.pilatesExperience ? 1 : 0) + (data.apparatusPreference.includes("Other") ? 1 : 0)
        filledFields = [
          data.pilatesExperience !== null,
          data.pilatesExperience ? data.pilatesDuration !== null : null,
          data.studioFrequency !== null,
          data.sessionPreference !== null,
          data.apparatusPreference.length > 0,
          data.apparatusPreference.includes("Other") ? data.customApparatus !== null : null
        ].filter(Boolean).length
        break
      }
    }

    return Math.round((filledFields / totalFields) * 100)
  }

  const formSections = useMemo(() => [
    {
      type: "basicQuestion" as FormType,
      title: SECTION_LABELS.BASIC_QUESTION.TITLE,
      description: SECTION_LABELS.BASIC_QUESTION.DESCRIPTION,
      icon: <User className="w-5 h-5" />,
      completion: calculateCompletion("basicQuestion"),
      color: SECTION_LABELS.BASIC_QUESTION.COLOR
    },
    {
      type: "pilates" as FormType,
      title: SECTION_LABELS.PILATES.TITLE,
      description: SECTION_LABELS.PILATES.DESCRIPTION,
      icon: <Activity className="w-5 h-5" />,
      completion: calculateCompletion("pilates"),
      color: SECTION_LABELS.PILATES.COLOR
    },
    {
      type: "fitnessBg" as FormType,
      title: SECTION_LABELS.FITNESS_BG.TITLE,
      description: SECTION_LABELS.FITNESS_BG.DESCRIPTION,
      icon: <Dumbbell className="w-5 h-5" />,
      completion: calculateCompletion("fitnessBg"),
      color: SECTION_LABELS.FITNESS_BG.COLOR
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
      type: "goals" as FormType,
      title: SECTION_LABELS.GOALS.TITLE,
      description: SECTION_LABELS.GOALS.DESCRIPTION,
      icon: <Target className="w-5 h-5" />,
      completion: calculateCompletion("goals"),
      color: SECTION_LABELS.GOALS.COLOR
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
