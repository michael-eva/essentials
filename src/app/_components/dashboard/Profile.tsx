"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { api } from "@/trpc/react"
import EditFormDialog from "@/app/_components/onboarding/profile/EditFormDialog"
import { useProfileCompletion, type FormData, type FormType } from "@/hooks/useProfileCompletion"
import { ProfileSkeleton } from "./DashboardSkeleton"
import DefaultBox from "../global/DefaultBox"
import { motion } from "framer-motion"

export default function ProfilePage() {
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null)
  const { isLoading, formData, formSections } = useProfileCompletion()
  const utils = api.useUtils()


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
        case "healthCons": {
          const healthData = data as FormData["healthCons"]

          postHealthConsiderations({
            injuries: healthData.injuries ?? false,
            injuriesDetails: healthData.injuries ? healthData.injuriesDetails ?? null : null,
            recentSurgery: healthData.recentSurgery ?? false,
            surgeryDetails: healthData.recentSurgery ? healthData.surgeryDetails ?? null : null,
            chronicConditions: healthData.chronicConditions,
            otherHealthConditions: healthData.chronicConditions.includes("Other") ? healthData.otherHealthConditions ?? null : null,
            pregnancy: healthData.pregnancy ?? "Not applicable",
            pregnancyConsultedDoctor: healthData.pregnancyConsultedDoctor ?? false,
            pregnancyConsultedDoctorDetails: healthData.pregnancyConsultedDoctorDetails ?? null
          })
          break
        }

        case "pilates": {
          const pilatesData = data as FormData["pilates"]
          postPilatesExperience({
            fitnessLevel: pilatesData.fitnessLevel,
            pilatesExperience: pilatesData.pilatesExperience,
            pilatesDuration: pilatesData.pilatesExperience ? pilatesData.pilatesDuration ?? null : null,
            pilatesStyles: pilatesData.pilatesStyles,
            homeEquipment: pilatesData.homeEquipment,
            fitnessGoals: pilatesData.fitnessGoals,
            otherFitnessGoals: pilatesData.otherFitnessGoals,
            specificGoals: pilatesData.specificGoals ?? undefined
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
      <div className="space-y-6">
        <ProfileSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DefaultBox
        title="Profile"
        description="Manage your personal information and preferences"
        showViewAll={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formSections.map((section, index) => (
            <motion.div
              key={section.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className="p-4 rounded-xl cursor-pointer hover:shadow-md transition-all border border-gray-200 bg-white hover:border-brand-brown"
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
            </motion.div>
          ))}
        </div>
      </DefaultBox>

      {selectedForm && formData && (
        <EditFormDialog
          open={!!selectedForm}
          onOpenChangeAction={(open: boolean) => !open && setSelectedForm(null)}
          formType={selectedForm}
          formData={formData[selectedForm]}
          onSubmitAction={(data) => handleFormSubmit(selectedForm, data)}
          formSections={formSections}
        />
      )}
    </div>
  )
} 
