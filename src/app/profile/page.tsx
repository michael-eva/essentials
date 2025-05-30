"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { useSession } from "@/contexts/SessionContext"
import { api } from "@/trpc/react"
import EditFormDialog from "@/app/_components/onboarding/profile/EditFormDialog"
import { User, Dumbbell, Target, Heart, Sparkles, Activity } from "lucide-react"

// Form data interface with proper optional types
interface FormData {
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
    injuries: boolean;
    recentSurgery: boolean;
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
    pilatesExperience: boolean;
    pilatesDuration: "Less than 3 months" | "3-6 months" | "6-12 months" | "1-3 years" | "More than 3 years" | null;
    studioFrequency: "Never" | "1-2 times per month" | "1 time per week" | "2-3 times per week" | "4+ times per week" | null;
    sessionPreference: "Group classes" | "Private sessions" | "Both" | "No preference" | null;
    instructors: string[];
    customInstructor: string | null;
    apparatusPreference: string[];
    customApparatus: string | null;
  };
}

type FormType = keyof FormData

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    basicQuestion: {
      name: null,
      age: null,
      height: null,
      weight: null,
      gender: null
    },
    fitnessBg: {
      fitnessLevel: null,
      exercises: [],
      exerciseFrequency: null,
      sessionLength: null,
      customExercise: null
    },
    goals: {
      fitnessGoals: [],
      goalTimeline: null,
      specificGoals: null
    },
    healthCons: {
      injuries: false,
      recentSurgery: false,
      chronicConditions: [],
      pregnancy: null,
      injuriesDetails: null,
      surgeryDetails: null,
      otherHealthConditions: []
    },
    pilates: {
      pilatesExperience: false,
      pilatesDuration: null,
      studioFrequency: null,
      sessionPreference: null,
      instructors: [],
      customInstructor: null,
      apparatusPreference: [],
      customApparatus: null
    },
    motivation: {
      motivation: [],
      progressTracking: [],
      otherMotivation: [],
      otherProgressTracking: []
    }
  })
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null)

  const { data: onboardingData } = api.onboarding.getOnboardingData.useQuery()

  useEffect(() => {
    if (onboardingData) {
      const transformedData: FormData = {
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
          injuries: onboardingData.injuries ?? false,
          recentSurgery: onboardingData.recentSurgery ?? false,
          chronicConditions: onboardingData.chronicConditions ?? [],
          pregnancy: onboardingData.pregnancy as "Not applicable" | "Pregnant" | "Postpartum (0-6 months)" | "Postpartum (6-12 months)" | null,
          injuriesDetails: onboardingData.injuriesDetails,
          surgeryDetails: onboardingData.surgeryDetails,
          otherHealthConditions: onboardingData.otherHealthConditions ?? []
        },
        pilates: {
          pilatesExperience: onboardingData.pilatesExperience ?? false,
          pilatesDuration: onboardingData.pilatesDuration as "Less than 3 months" | "3-6 months" | "6-12 months" | "1-3 years" | "More than 3 years" | null,
          studioFrequency: onboardingData.studioFrequency as "Never" | "1-2 times per month" | "1 time per week" | "2-3 times per week" | "4+ times per week" | null,
          sessionPreference: onboardingData.sessionPreference as "Group classes" | "Private sessions" | "Both" | "No preference" | null,
          instructors: onboardingData.instructors ?? [],
          customInstructor: onboardingData.customInstructor,
          apparatusPreference: onboardingData.apparatusPreference ?? [],
          customApparatus: onboardingData.customApparatus
        },
        motivation: {
          motivation: onboardingData.motivation ?? [],
          progressTracking: onboardingData.progressTracking ?? [],
          otherMotivation: onboardingData.otherMotivation ?? [],
          otherProgressTracking: onboardingData.otherProgressTracking ?? []
        }
      }
      setFormData(transformedData)
    }
    setIsLoading(false)
  }, [onboardingData])

  const { mutate: postBasicQuestions } = api.onboarding.postBasicQuestions.useMutation({
    onSuccess: () => {
      toast.success("Your profile has been updated successfully.")
      setSelectedForm(null)
    },
    onError: (error) => {
      console.error("Error updating form data:", error)
      toast.error("Failed to update your profile. Please try again.")
    }
  })

  const { mutate: postFitnessBackground } = api.onboarding.postFitnessBackground.useMutation({
    onSuccess: () => {
      toast.success("Your profile has been updated successfully.")
      setSelectedForm(null)
    },
    onError: (error) => {
      console.error("Error updating form data:", error)
      toast.error("Failed to update your profile. Please try again.")
    }
  })

  const { mutate: postHealthConsiderations } = api.onboarding.postHealthConsiderations.useMutation({
    onSuccess: () => {
      toast.success("Your profile has been updated successfully.")
      setSelectedForm(null)
    },
    onError: (error) => {
      console.error("Error updating form data:", error)
      toast.error("Failed to update your profile. Please try again.")
    }
  })

  const { mutate: postFitnessGoals } = api.onboarding.postFitnessGoals.useMutation({
    onSuccess: () => {
      toast.success("Your profile has been updated successfully.")
      setSelectedForm(null)
    },
    onError: (error) => {
      console.error("Error updating form data:", error)
      toast.error("Failed to update your profile. Please try again.")
    }
  })

  const { mutate: postPilatesExperience } = api.onboarding.postPilatesExperience.useMutation({
    onSuccess: () => {
      toast.success("Your profile has been updated successfully.")
      setSelectedForm(null)
    },
    onError: (error) => {
      console.error("Error updating form data:", error)
      toast.error("Failed to update your profile. Please try again.")
    }
  })

  const { mutate: postMotivation } = api.onboarding.postMotivation.useMutation({
    onSuccess: () => {
      toast.success("Your profile has been updated successfully.")
      setSelectedForm(null)
    },
    onError: (error) => {
      console.error("Error updating form data:", error)
      toast.error("Failed to update your profile. Please try again.")
    }
  })

  const formSections = [
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
  ]

  function calculateCompletion(formType: FormType): number {
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
        totalFields = 5
        filledFields = [
          data.fitnessLevel,
          data.exercises.length > 0,
          data.exerciseFrequency,
          data.sessionLength,
          data.customExercise
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
        totalFields = 7
        filledFields = [
          data.injuries,
          data.recentSurgery,
          data.chronicConditions.length > 0,
          data.pregnancy,
          data.injuriesDetails,
          data.surgeryDetails,
          data.otherHealthConditions.length > 0
        ].filter(Boolean).length
        break
      }
      case "motivation": {
        const data = section as FormData["motivation"]
        totalFields = 4
        filledFields = [
          data.motivation.length > 0,
          data.progressTracking.length > 0,
          data.otherMotivation.length > 0,
          data.otherProgressTracking.length > 0
        ].filter(Boolean).length
        break
      }
      case "pilates": {
        const data = section as FormData["pilates"]
        totalFields = 8
        filledFields = [
          data.pilatesExperience,
          data.pilatesDuration,
          data.studioFrequency,
          data.sessionPreference,
          data.instructors.length > 0,
          data.customInstructor,
          data.apparatusPreference.length > 0,
          data.customApparatus
        ].filter(Boolean).length
        break
      }
    }

    return Math.round((filledFields / totalFields) * 100)
  }

  const handleFormSubmit = async (formType: FormType, data: FormData[FormType]) => {
    try {
      const updatedData = { ...formData, [formType]: data }
      setFormData(updatedData)

      switch (formType) {
        case "basicQuestion": {
          const basicData = data as FormData["basicQuestion"]
          if (basicData.name && basicData.age && basicData.height && basicData.weight && basicData.gender) {
            postBasicQuestions({
              name: basicData.name,
              age: basicData.age,
              height: basicData.height,
              weight: basicData.weight,
              gender: basicData.gender
            })
          }
          break
        }
        case "fitnessBg": {
          const fitnessData = data as FormData["fitnessBg"]
          if (fitnessData.fitnessLevel && fitnessData.exerciseFrequency && fitnessData.sessionLength) {
            postFitnessBackground({
              fitnessLevel: fitnessData.fitnessLevel,
              exercises: fitnessData.exercises,
              exerciseFrequency: fitnessData.exerciseFrequency,
              sessionLength: fitnessData.sessionLength,
              otherExercises: fitnessData.customExercise ? [fitnessData.customExercise] : undefined
            })
          }
          break
        }
        case "healthCons": {
          const healthData = data as FormData["healthCons"]
          if (healthData.pregnancy) {
            postHealthConsiderations({
              injuries: healthData.injuries,
              recentSurgery: healthData.recentSurgery,
              chronicConditions: healthData.chronicConditions,
              pregnancy: healthData.pregnancy,
              injuriesDetails: healthData.injuriesDetails ?? undefined,
              surgeryDetails: healthData.surgeryDetails ?? undefined,
              otherHealthConditions: healthData.otherHealthConditions
            })
          }
          break
        }
        case "goals": {
          const goalsData = data as FormData["goals"]
          if (goalsData.goalTimeline) {
            postFitnessGoals({
              fitnessGoals: goalsData.fitnessGoals,
              goalTimeline: goalsData.goalTimeline,
              specificGoals: goalsData.specificGoals ?? undefined
            })
          }
          break
        }
        case "pilates": {
          const pilatesData = data as FormData["pilates"]
          if (pilatesData.studioFrequency && pilatesData.sessionPreference) {
            postPilatesExperience({
              pilatesExperience: pilatesData.pilatesExperience,
              studioFrequency: pilatesData.studioFrequency,
              sessionPreference: pilatesData.sessionPreference,
              instructors: pilatesData.instructors,
              apparatusPreference: pilatesData.apparatusPreference,
              pilatesDuration: pilatesData.pilatesDuration ?? undefined,
              customInstructor: pilatesData.customInstructor ?? undefined,
              customApparatus: pilatesData.customApparatus ?? undefined
            })
          }
          break
        }
        case "motivation": {
          const motivationData = data as FormData["motivation"]
          postMotivation({
            motivation: motivationData.motivation,
            progressTracking: motivationData.progressTracking,
            otherMotivation: motivationData.otherMotivation,
            otherProgressTracking: motivationData.otherProgressTracking
          })
          break
        }
      }
    } catch (error) {
      console.error("Error updating form data:", error)
      toast.error("Failed to update your profile. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl"
          >
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formSections.map((section) => (
            <Card
              key={section.type}
              className="p-4 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedForm(section.type)}
            >
              <div className="flex items-start space-x-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${section.color}20` }}
                >
                  <div style={{ color: section.color }}>{section.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.description}</p>
                  <div className="mt-2">
                    <Progress value={section.completion} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {section.completion}% Complete
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedForm && (
        <EditFormDialog
          open={!!selectedForm}
          onOpenChange={(open) => !open && setSelectedForm(null)}
          formType={selectedForm}
          formData={formData[selectedForm]}
          onSubmit={(data) => handleFormSubmit(selectedForm, data)}
          formSections={formSections}
        />
      )}
    </div>
  )
} 
