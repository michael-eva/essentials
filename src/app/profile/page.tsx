"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { api } from "@/trpc/react"
import EditFormDialog from "@/app/_components/onboarding/profile/EditFormDialog"
import DashboardHeader from "@/app/_components/common/DashboardHeader"
import { useProfileCompletion, type FormData, type FormType } from "@/hooks/useProfileCompletion"

export default function ProfilePage() {
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null)
  const { isLoading, formData, formSections } = useProfileCompletion()
  const utils = api.useUtils()
  const { mutate: postBasicQuestions } = api.onboarding.postBasicQuestions.useMutation({
    onSuccess: () => {
      toast.success("Your profile has been updated successfully.")
      setSelectedForm(null)
      utils.onboarding.getOnboardingData.invalidate()
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
      utils.onboarding.getOnboardingData.invalidate()
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
      utils.onboarding.getOnboardingData.invalidate()
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
      utils.onboarding.getOnboardingData.invalidate()
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
      utils.onboarding.getOnboardingData.invalidate()
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
      utils.onboarding.getOnboardingData.invalidate()
    },
    onError: (error) => {
      console.error("Error updating form data:", error)
      toast.error("Failed to update your profile. Please try again.")
    }
  })

  const handleFormSubmit = async (formType: FormType, data: FormData[FormType]) => {
    try {
      switch (formType) {
        case "basicQuestion": {
          const basicData = data as FormData["basicQuestion"]
          postBasicQuestions({
            name: basicData.name,
            age: basicData.age,
            height: basicData.height,
            weight: basicData.weight,
            gender: basicData.gender
          })
          break
        }
        case "fitnessBg": {
          const fitnessData = data as FormData["fitnessBg"]
          postFitnessBackground({
            fitnessLevel: fitnessData.fitnessLevel,
            exercises: fitnessData.exercises,
            exerciseFrequency: fitnessData.exerciseFrequency,
            sessionLength: fitnessData.sessionLength,
            otherExercises: fitnessData.exercises.includes("Other") ? [fitnessData.customExercise ?? ""] : null
          })
          break
        }
        case "healthCons": {
          const healthData = data as FormData["healthCons"]
          console.log(healthData)
          postHealthConsiderations({
            injuries: healthData.injuries ?? false,
            recentSurgery: healthData.recentSurgery ?? false,
            chronicConditions: healthData.chronicConditions,
            pregnancy: healthData.pregnancy ?? "Not applicable",
            injuriesDetails: healthData.injuries ? healthData.injuriesDetails ?? null : null,
            surgeryDetails: healthData.recentSurgery ? healthData.surgeryDetails ?? null : null,
            otherHealthConditions: healthData.chronicConditions.includes("Other") ? healthData.otherHealthConditions ?? null : null
          })
          break
        }
        case "goals": {
          const goalsData = data as FormData["goals"]
          postFitnessGoals({
            fitnessGoals: goalsData.fitnessGoals,
            goalTimeline: goalsData.goalTimeline,
            specificGoals: goalsData.specificGoals ?? undefined
          })
          break
        }
        case "pilates": {
          const pilatesData = data as FormData["pilates"]
          postPilatesExperience({
            pilatesExperience: pilatesData.pilatesExperience,
            studioFrequency: pilatesData.studioFrequency,
            sessionPreference: pilatesData.sessionPreference,
            apparatusPreference: pilatesData.apparatusPreference,
            pilatesDuration: pilatesData.pilatesExperience ? pilatesData.pilatesDuration ?? null : null,
            customApparatus: pilatesData.customApparatus ?? undefined
          })
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
  console.log(formSections)
  return (
    <>
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Profile</h1>
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

        {selectedForm && formData && (
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
    </>
  )
} 
