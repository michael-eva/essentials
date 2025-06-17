import { useMemo } from "react"
import { api } from "@/trpc/react"
import { User, Dumbbell, Target, Heart, Sparkles, Activity } from "lucide-react"

// Form data interface with proper optional types
export interface FormData {
  basicQuestion: {
    name: string | null;
    age: number | null;
    height: number | null;
    weight: number | null;
    gender: "Male" | "Female" | "Prefer not to say" | null;
  };
  fitnessBg: {
    fitnessLevel: "Beginner" | "Intermediate" | "Advanced" | null;
    exercises: string[];
    exerciseFrequency: "0" | "1-2" | "3-4" | "5+" | null;
    sessionLength: "Less than 15 minutes" | "15-30 minutes" | "30-45 minutes" | "45-60 minutes" | "More than 60 minutes" | null;
    customExercise: string | null;
  };
  goals: {
    fitnessGoals: string[];
    goalTimeline: "1-3 months" | "3-6 months" | "6-12 months" | "More than a year" | null;
    specificGoals: string | null;
  };
  healthCons: {
    injuries: boolean | null;
    recentSurgery: boolean | null;
    chronicConditions: string[];
    pregnancy: "Not applicable" | "Pregnant" | "Postpartum (0-6 months)" | "Postpartum (6-12 months)" | null;
    injuriesDetails: string | null;
    surgeryDetails: string | null;
    otherHealthConditions: string[];
  };
  motivation: {
    motivation: string[];
    progressTracking: string[];
    otherMotivation: string[];
    otherProgressTracking: string[];
  };
  pilates: {
    pilatesExperience: boolean | null;
    pilatesDuration: "Less than 3 months" | "3-6 months" | "6-12 months" | "1-3 years" | "More than 3 years" | null;
    studioFrequency: "Never" | "1-2 times per month" | "1 time per week" | "2-3 times per week" | "4+ times per week" | null;
    sessionPreference: "Group classes" | "Private sessions" | "Both" | "No preference" | null;
    apparatusPreference: string[];
    customApparatus: string | null;
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

  const formData = useMemo(() => {
    if (!onboardingData) return null

    return {
      basicQuestion: {
        name: onboardingData.name,
        age: onboardingData.age,
        height: onboardingData.height,
        weight: onboardingData.weight,
        gender: onboardingData.gender as "Male" | "Female" | "Prefer not to say" | null
      },
      fitnessBg: {
        fitnessLevel: onboardingData.fitnessLevel as "Beginner" | "Intermediate" | "Advanced" | null,
        exercises: onboardingData.exercises ?? [],
        exerciseFrequency: onboardingData.exerciseFrequency as "0" | "1-2" | "3-4" | "5+" | null,
        sessionLength: onboardingData.sessionLength as "Less than 15 minutes" | "15-30 minutes" | "30-45 minutes" | "45-60 minutes" | "More than 60 minutes" | null,
        customExercise: onboardingData.otherExercises?.[0] ?? null
      },
      goals: {
        fitnessGoals: onboardingData.fitnessGoals ?? [],
        goalTimeline: onboardingData.goalTimeline as "1-3 months" | "3-6 months" | "6-12 months" | "More than a year" | null,
        specificGoals: onboardingData.specificGoals
      },
      healthCons: {
        injuries: onboardingData.injuries ?? null,
        recentSurgery: onboardingData.recentSurgery ?? null,
        chronicConditions: onboardingData.chronicConditions ?? [],
        pregnancy: onboardingData.pregnancy as "Not applicable" | "Pregnant" | "Postpartum (0-6 months)" | "Postpartum (6-12 months)" | null,
        injuriesDetails: onboardingData.injuriesDetails,
        surgeryDetails: onboardingData.surgeryDetails,
        otherHealthConditions: onboardingData.otherHealthConditions ?? []
      },
      pilates: {
        pilatesExperience: onboardingData.pilatesExperience ?? null,
        pilatesDuration: onboardingData.pilatesDuration as "Less than 3 months" | "3-6 months" | "6-12 months" | "1-3 years" | "More than 3 years" | null,
        studioFrequency: onboardingData.studioFrequency as "Never" | "1-2 times per month" | "1 time per week" | "2-3 times per week" | "4+ times per week" | null,
        sessionPreference: onboardingData.sessionPreference as "Group classes" | "Private sessions" | "Both" | "No preference" | null,
        apparatusPreference: onboardingData.apparatusPreference ?? [],
        customApparatus: onboardingData.customApparatus
      },
      motivation: {
        motivation: onboardingData.motivation ?? [],
        progressTracking: onboardingData.progressTracking ?? [],
        otherMotivation: onboardingData.otherMotivation ?? [],
        otherProgressTracking: onboardingData.otherProgressTracking ?? []
      }
    } as FormData
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
      title: "Basic Info",
      description: "Tell us about yourself",
      icon: <User className="w-5 h-5" />,
      completion: calculateCompletion("basicQuestion"),
      color: "#007AFF"
    },
    {
      type: "fitnessBg" as FormType,
      title: "Fitness Background",
      description: "Your exercise history",
      icon: <Dumbbell className="w-5 h-5" />,
      completion: calculateCompletion("fitnessBg"),
      color: "#FF9500"
    },
    {
      type: "goals" as FormType,
      title: "Goals",
      description: "What you want to achieve",
      icon: <Target className="w-5 h-5" />,
      completion: calculateCompletion("goals"),
      color: "#FF2D55"
    },
    {
      type: "healthCons" as FormType,
      title: "Health Considerations",
      description: "Important health information",
      icon: <Heart className="w-5 h-5" />,
      completion: calculateCompletion("healthCons"),
      color: "#5856D6"
    },
    {
      type: "motivation" as FormType,
      title: "Motivation",
      description: "What drives you",
      icon: <Sparkles className="w-5 h-5" />,
      completion: calculateCompletion("motivation"),
      color: "#FFCC00"
    },
    {
      type: "pilates" as FormType,
      title: "Pilates",
      description: "Your Pilates experience",
      icon: <Activity className="w-5 h-5" />,
      completion: calculateCompletion("pilates"),
      color: "#34C759"
    }
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
