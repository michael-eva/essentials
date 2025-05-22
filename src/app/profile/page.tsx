"use client"

import { useState, useEffect } from "react"
import { User, Briefcase, MapPin, GraduationCap, Heart, CheckCircle, Activity } from "lucide-react"

import { motion } from "framer-motion"
// import SuccessToast from "./SuccessToast"
import { formSchema as basicQuestionFormSchema } from "../_components/onboarding/BasicQuestionForm"
import { formSchema as fitnessBgFormSchema } from "../_components/onboarding/FitnessBgForm"
import { formSchema as goalsFormSchema } from "../_components/onboarding/GoalsForm"
import { formSchema as healthConsFormSchema } from "../_components/onboarding/HealthConsForm"
import { formSchema as motivationFormSchema } from "../_components/onboarding/MotivationForm"
import { formSchema as pilatesFormSchema } from "../_components/onboarding/PilatesForm"
import { z } from "zod"
import { api } from "@/trpc/react"
import EditFormDialog from "../_components/onboarding/profile/EditFormDialog"
import FormSection from "../_components/onboarding/profile/FormSection"
// Form types
type FormType = "basicQuestion" | "fitnessBg" | "goals" | "healthCons" | "motivation" | "pilates"

// Form data interface
interface FormData {
  basicQuestion: z.infer<typeof basicQuestionFormSchema>
  fitnessBg: z.infer<typeof fitnessBgFormSchema>
  goals: z.infer<typeof goalsFormSchema>
  healthCons: z.infer<typeof healthConsFormSchema>
  motivation: z.infer<typeof motivationFormSchema>
  pilates: z.infer<typeof pilatesFormSchema>
}

export default function ProfileComponent() {
  const { data: onboardingData } = api.onboarding.getOnboardingData.useQuery();
  // Initial form data
  const [formData, setFormData] = useState<FormData>({
    basicQuestion: {
      name: "",
      age: 0,
      height: 0,
      weight: 0,
      gender: "Prefer not to say"
    },
    fitnessBg: {
      fitnessLevel: "Beginner",
      exercises: [],
      exerciseFrequency: "0",
      sessionLength: "30-45 minutes",
      customExercise: ""
    },
    goals: {
      fitnessGoals: [],
      goalTimeline: "3-6 months",
      specificGoals: ""
    },
    healthCons: {
      injuries: false,
      recentSurgery: false,
      chronicConditions: [],
      pregnancy: "Not applicable",
      injuriesDetails: "",
      surgeryDetails: "",
      otherHealthConditions: []
    },
    motivation: {
      motivation: [],
      progressTracking: [],
      otherMotivation: [],
      otherProgressTracking: []
    },
    pilates: {
      pilatesExperience: false,
      pilatesDuration: undefined,
      studioFrequency: "Never",
      sessionPreference: "No preference",
      instructors: [],
      customInstructor: "",
      apparatusPreference: [],
      customApparatus: ""
    }
  })

  // Update form data when onboardingData changes
  useEffect(() => {
    if (onboardingData) {
      setFormData({
        basicQuestion: {
          name: onboardingData.name ?? "",
          age: onboardingData.age ?? 0,
          height: onboardingData.height ?? 0,
          weight: onboardingData.weight ?? 0,
          gender: (onboardingData.gender as "Male" | "Female" | "Prefer not to say") ?? "Prefer not to say"
        },
        fitnessBg: {
          fitnessLevel: (onboardingData.fitnessLevel as "Beginner" | "Intermediate" | "Advanced") ?? "Beginner",
          exercises: onboardingData.exercises ?? [],
          exerciseFrequency: (onboardingData.exerciseFrequency as "0" | "1-2" | "3-4" | "5+") ?? "0",
          sessionLength: (onboardingData.sessionLength as "Less than 15 minutes" | "15-30 minutes" | "30-45 minutes" | "45-60 minutes" | "More than 60 minutes") ?? "30-45 minutes",
          customExercise: onboardingData.otherExercises?.[0] ?? ""
        },
        goals: {
          fitnessGoals: onboardingData.fitnessGoals ?? [],
          goalTimeline: (onboardingData.goalTimeline as "1-3 months" | "3-6 months" | "6-12 months" | "More than a year") ?? "3-6 months",
          specificGoals: onboardingData.specificGoals ?? ""
        },
        healthCons: {
          injuries: onboardingData.injuries ?? false,
          recentSurgery: onboardingData.recentSurgery ?? false,
          chronicConditions: onboardingData.chronicConditions ?? [],
          pregnancy: (onboardingData.pregnancy as "Not applicable" | "Pregnant" | "Postpartum (0-6 months)" | "Postpartum (6-12 months)") ?? "Not applicable",
          injuriesDetails: onboardingData.injuriesDetails ?? "",
          surgeryDetails: onboardingData.surgeryDetails ?? "",
          otherHealthConditions: onboardingData.otherHealthConditions ?? []
        },
        motivation: {
          motivation: onboardingData.motivation ?? [],
          progressTracking: onboardingData.progressTracking ?? [],
          otherMotivation: Array.isArray(onboardingData.otherMotivation) ? onboardingData.otherMotivation : [],
          otherProgressTracking: Array.isArray(onboardingData.otherProgressTracking) ? onboardingData.otherProgressTracking : []
        },
        pilates: {
          pilatesExperience: onboardingData.pilatesExperience ?? false,
          pilatesDuration: (onboardingData.pilatesDuration as "Less than 3 months" | "3-6 months" | "6-12 months" | "1-3 years" | "More than 3 years" | undefined) ?? undefined,
          studioFrequency: (onboardingData.studioFrequency as "Never" | "1-2 times per month" | "1 time per week" | "2-3 times per week" | "4+ times per week") ?? "Never",
          sessionPreference: (onboardingData.sessionPreference as "Group classes" | "Private sessions" | "Both" | "No preference") ?? "No preference",
          instructors: onboardingData.instructors ?? [],
          customInstructor: onboardingData.customInstructor ?? "",
          apparatusPreference: onboardingData.apparatusPreference ?? [],
          customApparatus: onboardingData.customApparatus ?? ""
        }
      })
    }
  }, [onboardingData])

  // Convert form data to string format for display
  const convertFormDataToStrings = (data: FormData[FormType]): Record<string, string> => {
    const result: Record<string, string> = {}

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        result[key] = value.join(", ")
      } else if (typeof value === "boolean") {
        result[key] = value ? "Yes" : "No"
      } else if (value === null || value === undefined) {
        result[key] = ""
      } else if (typeof value === "object") {
        result[key] = JSON.stringify(value)
      } else if (typeof value === "number") {
        result[key] = value.toString()
      } else if (typeof value === "string") {
        result[key] = value
      } else {
        result[key] = String(value)
      }
    })

    return result
  }

  // Track completion status for each form
  const [completion, setCompletion] = useState({
    basicQuestion: 0,
    fitnessBg: 0,
    goals: 0,
    healthCons: 0,
    motivation: 0,
    pilates: 0,
  })

  // Update completion when formData changes
  useEffect(() => {
    setCompletion({
      basicQuestion: calculateCompletion("basicQuestion", formData.basicQuestion),
      fitnessBg: calculateCompletion("fitnessBg", formData.fitnessBg),
      goals: calculateCompletion("goals", formData.goals),
      healthCons: calculateCompletion("healthCons", formData.healthCons),
      motivation: calculateCompletion("motivation", formData.motivation),
      pilates: calculateCompletion("pilates", formData.pilates),
    })
  }, [formData])

  // Helper function to calculate completion percentage for each form type
  function calculateCompletion(formType: FormType, data: FormData[FormType]): number {
    if (!data) return 0;

    const isValueValid = (value: unknown): boolean => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value !== "";
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "boolean") return true;
      return true;
    };

    switch (formType) {
      case "basicQuestion": {
        const basicData = data as FormData["basicQuestion"];
        const basicFields = ["name", "age", "height", "weight", "gender"] as const;
        return Math.round((basicFields.filter(field => isValueValid(basicData[field])).length / basicFields.length) * 100);
      }

      case "fitnessBg": {
        const fitnessData = data as FormData["fitnessBg"];
        const fitnessFields = ["fitnessLevel", "exercises", "exerciseFrequency", "sessionLength"] as const;
        const hasExercises = Array.isArray(fitnessData.exercises) && fitnessData.exercises.length > 0;
        const hasCustomExercise = fitnessData.exercises?.includes("Other") ? (fitnessData.customExercise?.length ?? 0) > 0 : true;
        return Math.round((fitnessFields.filter(field => isValueValid(fitnessData[field])).length + (hasExercises ? 1 : 0) + (hasCustomExercise ? 1 : 0)) / (fitnessFields.length + 2) * 100);
      }

      case "goals": {
        const goalsData = data as FormData["goals"];
        const goalsFields = ["fitnessGoals", "goalTimeline"] as const;
        const hasGoals = Array.isArray(goalsData.fitnessGoals) && goalsData.fitnessGoals.length > 0;
        return Math.round((goalsFields.filter(field => isValueValid(goalsData[field])).length + (hasGoals ? 1 : 0)) / (goalsFields.length + 1) * 100);
      }

      case "healthCons": {
        const healthData = data as FormData["healthCons"];
        const healthFields = ["injuries", "recentSurgery", "chronicConditions", "pregnancy"] as const;
        const hasConditions = Array.isArray(healthData.chronicConditions) && healthData.chronicConditions.length > 0;
        const hasInjuryDetails = !healthData.injuries || (healthData.injuries && healthData.injuriesDetails?.trim());
        const hasSurgeryDetails = !healthData.recentSurgery || (healthData.recentSurgery && healthData.surgeryDetails?.trim());
        const hasCustomConditions = healthData.chronicConditions?.includes("Other") ? (healthData.otherHealthConditions?.length ?? 0) > 0 : true;
        return Math.round((healthFields.filter(field => isValueValid(healthData[field])).length + (hasConditions ? 1 : 0) + (hasInjuryDetails ? 1 : 0) + (hasSurgeryDetails ? 1 : 0) + (hasCustomConditions ? 1 : 0)) / (healthFields.length + 4) * 100);
      }

      case "motivation": {
        const motivationData = data as FormData["motivation"];
        const motivationFields = ["motivation", "progressTracking"] as const;
        const hasMotivation = Array.isArray(motivationData.motivation) && motivationData.motivation.length > 0;
        const hasTracking = Array.isArray(motivationData.progressTracking) && motivationData.progressTracking.length > 0;
        const hasCustomMotivation = motivationData.motivation?.includes("Other") ? (motivationData.otherMotivation?.length ?? 0) > 0 : true;
        const hasCustomTracking = motivationData.progressTracking?.includes("Other") ? (motivationData.otherProgressTracking?.length ?? 0) > 0 : true;
        return Math.round((motivationFields.filter(field => isValueValid(motivationData[field])).length + (hasMotivation ? 1 : 0) + (hasTracking ? 1 : 0) + (hasCustomMotivation ? 1 : 0) + (hasCustomTracking ? 1 : 0)) / (motivationFields.length + 4) * 100);
      }

      case "pilates": {
        const pilatesData = data as FormData["pilates"];
        const pilatesFields = ["pilatesExperience", "studioFrequency", "sessionPreference", "instructors", "apparatusPreference"] as const;
        const hasInstructors = Array.isArray(pilatesData.instructors) && pilatesData.instructors.length > 0;
        const hasApparatus = Array.isArray(pilatesData.apparatusPreference) && pilatesData.apparatusPreference.length > 0;
        const hasDuration = !pilatesData.pilatesExperience || (pilatesData.pilatesExperience && pilatesData.pilatesDuration);
        return Math.round((pilatesFields.filter(field => isValueValid(pilatesData[field])).length + (hasInstructors ? 1 : 0) + (hasApparatus ? 1 : 0) + (hasDuration ? 1 : 0)) / (pilatesFields.length + 3) * 100);
      }

      default:
        return 0;
    }
  }

  // Calculate overall completion percentage
  const overallCompletion =
    Object.values(completion).reduce((sum, value) => sum + value, 0) / Object.values(completion).length

  // State for the edit dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentForm, setCurrentForm] = useState<FormType>("basicQuestion")

  // State for success toast

  const [recentlyCompleted, setRecentlyCompleted] = useState<FormType | null>(null)

  // State for completed sections
  const [completedSections, setCompletedSections] = useState<Record<FormType, boolean>>({
    basicQuestion: false,
    fitnessBg: false,
    goals: false,
    healthCons: false,
    motivation: false,
    pilates: false,
  })

  // Get completed count
  const completedCount = Object.values(completedSections).filter(Boolean).length

  // Form section configurations with Apple-inspired colors
  const formSections = [
    {
      type: "basicQuestion" as FormType,
      title: "Basic Info",
      description: "Personal information",
      icon: <User className="h-5 w-5" />,
      completion: completion.basicQuestion,
      color: "#007AFF", // iOS blue
    },
    {
      type: "fitnessBg" as FormType,
      title: "Fitness Background",
      description: "Your fitness journey",
      icon: <Briefcase className="h-5 w-5" />,
      completion: completion.fitnessBg,
      color: "#5856D6", // iOS purple
    },
    {
      type: "goals" as FormType,
      title: "Goals",
      description: "Your fitness goals",
      icon: <MapPin className="h-5 w-5" />,
      completion: completion.goals,
      color: "#34C759", // iOS green
    },
    {
      type: "healthCons" as FormType,
      title: "Health Considerations",
      description: "Health information",
      icon: <GraduationCap className="h-5 w-5" />,
      completion: completion.healthCons,
      color: "#FF2D55", // iOS pink
    },
    {
      type: "motivation" as FormType,
      title: "Motivation",
      description: "What drives you",
      icon: <Heart className="h-5 w-5" />,
      completion: completion.motivation,
      color: "#FF9500", // iOS orange
    },
    {
      type: "pilates" as FormType,
      title: "Pilates",
      description: "Pilates preferences",
      icon: <Activity className="h-5 w-5" />,
      completion: completion.pilates,
      color: "#AF52DE", // iOS deep purple
    },
  ]

  // Check for newly completed sections
  useEffect(() => {
    const newCompletedSections = { ...completedSections }
    let sectionCompleted = false

    Object.entries(completion).forEach(([form, value]) => {
      if (value === 100 && !completedSections[form as FormType]) {
        newCompletedSections[form as FormType] = true
        sectionCompleted = true
        setRecentlyCompleted(form as FormType)
      }
    })

    if (sectionCompleted) {
      setCompletedSections(newCompletedSections)
    }
  }, [completion, completedSections, formSections])

  // Handle opening the edit dialog
  const handleEditForm = (formType: FormType) => {
    setCurrentForm(formType)
    setIsDialogOpen(true)
  }

  // Handle form submission
  const handleFormSubmit = (formType: FormType, data: FormData[FormType]) => {
    // Update form data
    setFormData((prev) => ({
      ...prev,
      [formType]: data,
    }))

    // Calculate new completion percentage based on filled fields
    const totalFields = Object.keys(data).length
    const filledFields = Object.values(data).filter((value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value !== "";
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "boolean") return true;
      return true;
    }).length
    const newCompletionPercentage = Math.round((filledFields / totalFields) * 100)

    // Update completion state
    setCompletion((prev) => ({
      ...prev,
      [formType]: newCompletionPercentage,
    }))

    // Close the dialog
    setIsDialogOpen(false)
  }

  // Get motivational message based on completion
  const getMotivationalMessage = () => {
    if (overallCompletion < 20) return "Let's get started"
    if (overallCompletion < 40) return "Making progress"
    if (overallCompletion < 60) return "Halfway there"
    if (overallCompletion < 80) return "Almost complete"
    if (overallCompletion < 100) return "Nearly perfect"
    return "Profile complete"
  }

  return (
    <div className="space-y-6">
      {/* <AnimatePresence>{showToast && <SuccessToast message={toastMessage} />}</AnimatePresence> */}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="shadow-lg overflow-hidden bg-white"
      >
        <div className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Profile</h2>
            <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-gray-500">{completedCount}/6</span>
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">{getMotivationalMessage()}</span>
              <span className="text-sm font-medium text-gray-900">{Math.round(overallCompletion)}%</span>
            </div>

            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overallCompletion}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-3 px-4">
        {formSections.map((section, index) => (
          <motion.div
            key={section.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <FormSection
              title={section.title}
              description={section.description}
              icon={section.icon}
              completion={section.completion}
              onClick={() => handleEditForm(section.type)}
              data={convertFormDataToStrings(formData[section.type])}
              color={section.color}
              isComplete={completedSections[section.type]}
              isHighlighted={recentlyCompleted === section.type}
            />
          </motion.div>
        ))}
      </div>

      <EditFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formType={currentForm}
        formData={formData[currentForm]}
        onSubmit={(data) => handleFormSubmit(currentForm, data)}
        formSections={formSections}
      />
    </div>
  )
}
