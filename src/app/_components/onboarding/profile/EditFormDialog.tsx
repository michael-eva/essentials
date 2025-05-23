"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { formSchema as basicQuestionFormSchema } from "@/app/_components/onboarding/BasicQuestionForm"
import { formSchema as fitnessBgFormSchema } from "@/app/_components/onboarding/FitnessBgForm"
import { formSchema as goalsFormSchema } from "@/app/_components/onboarding/GoalsForm"
import { formSchema as healthConsFormSchema } from "@/app/_components/onboarding/HealthConsForm"
import { formSchema as motivationFormSchema } from "@/app/_components/onboarding/MotivationForm"
import { formSchema as pilatesFormSchema } from "../PilatesForm"
import { z } from "zod"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills"
import { Textarea } from "@/components/ui/textarea"

type FormType = "basicQuestion" | "fitnessBg" | "goals" | "healthCons" | "pilates" | "motivation"

type FormData = {
  basicQuestion: z.infer<typeof basicQuestionFormSchema>
  fitnessBg: z.infer<typeof fitnessBgFormSchema>
  goals: z.infer<typeof goalsFormSchema>
  healthCons: z.infer<typeof healthConsFormSchema>
  pilates: z.infer<typeof pilatesFormSchema>
  motivation: z.infer<typeof motivationFormSchema>
}

interface EditFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formType: FormType
  formData: FormData[FormType]
  onSubmit: (data: FormData[FormType]) => void
  formSections: Array<{
    type: FormType
    title: string
    description: string
    icon: React.ReactNode
    completion: number
    color: string
  }>
}

export default function EditFormDialog({ open, onOpenChange, formType, formData, onSubmit, formSections }: EditFormDialogProps) {
  const [data, setData] = useState<FormData[FormType]>(() => {
    // Initialize with default values based on form type
    switch (formType) {
      case "basicQuestion":
        return {
          name: "",
          age: 0,
          height: 0,
          weight: 0,
          gender: "Prefer not to say"
        } as FormData["basicQuestion"]
      case "fitnessBg":
        return {
          fitnessLevel: "Beginner",
          exercises: [],
          exerciseFrequency: "0",
          sessionLength: "30-45 minutes",
          customExercise: ""
        } as FormData["fitnessBg"]
      case "goals":
        return {
          fitnessGoals: [],
          goalTimeline: "3-6 months",
          specificGoals: ""
        } as FormData["goals"]
      case "healthCons":
        return {
          injuries: false,
          recentSurgery: false,
          chronicConditions: [],
          pregnancy: "Not applicable",
          injuriesDetails: "",
          surgeryDetails: "",
          otherHealthConditions: []
        } as FormData["healthCons"]
      case "pilates":
        return {
          pilatesExperience: false,
          pilatesDuration: undefined,
          studioFrequency: "Never",
          sessionPreference: "No preference",
          instructors: [],
          customInstructor: "",
          apparatusPreference: [],
          customApparatus: ""
        } as FormData["pilates"]
      case "motivation":
        return {
          motivation: [],
          progressTracking: [],
          otherMotivation: [],
          otherProgressTracking: []
        } as FormData["motivation"]

      default:
        return {} as FormData[FormType]
    }
  })

  useEffect(() => {
    if (formData) {
      setData(formData)
    }
  }, [formData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(data)
  }

  const renderFormFields = () => {
    // Ensure we have valid data for the current form type
    const safeData = data || {
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
      pilates: {
        pilatesExperience: false,
        pilatesDuration: undefined,
        studioFrequency: "Never",
        sessionPreference: "No preference",
        instructors: [],
        customInstructor: "",
        apparatusPreference: [],
        customApparatus: ""
      },
      motivation: {
        motivation: [],
        progressTracking: [],
        otherMotivation: [],
        otherProgressTracking: []
      }
    }[formType] as FormData[FormType]

    const renderField = (label: string, children: React.ReactNode, index: number) => (
      <motion.div
        key={label}
        className="space-y-2"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Label htmlFor={label} className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        {children}
      </motion.div>
    )

    switch (formType) {
      case "basicQuestion": {
        const typedData = safeData as FormData["basicQuestion"]
        return (
          <>
            {renderField("Name", (
              <Input
                id="name"
                value={typedData.name}
                onChange={(e) => setData({ ...typedData, name: e.target.value })}
                className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
                style={{ height: "44px", fontSize: "15px" }}
              />
            ), 0)}
            {renderField("Age", (
              <Input
                id="age"
                type="number"
                value={typedData.age}
                onChange={(e) => setData({ ...typedData, age: parseInt(e.target.value) })}
                className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
                style={{ height: "44px", fontSize: "15px" }}
              />
            ), 1)}
            {renderField("Height (cm)", (
              <Input
                id="height"
                type="number"
                value={typedData.height}
                onChange={(e) => setData({ ...typedData, height: parseInt(e.target.value) })}
                className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
                style={{ height: "44px", fontSize: "15px" }}
              />
            ), 2)}
            {renderField("Weight (kg)", (
              <Input
                id="weight"
                type="number"
                value={typedData.weight}
                onChange={(e) => setData({ ...typedData, weight: parseInt(e.target.value) })}
                className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
                style={{ height: "44px", fontSize: "15px" }}
              />
            ), 3)}
            {renderField("Gender", (
              <Select
                value={typedData.gender}
                onValueChange={(value: "Male" | "Female" | "Prefer not to say") => setData({ ...typedData, gender: value })}
              >
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 w-full min-h-[44px]">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            ), 4)}
          </>
        )
      }

      case "fitnessBg": {
        const typedData = safeData as FormData["fitnessBg"]
        return (
          <>
            {renderField("Fitness Level", (
              <Select
                value={typedData.fitnessLevel}
                onValueChange={(value: "Beginner" | "Intermediate" | "Advanced") => setData({ ...typedData, fitnessLevel: value })}
              >
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            ), 0)}
            {renderField("Exercises", (
              <div className="space-y-2">
                <MultiSelectPills
                  options={["Running", "Cycling", "Swimming", "Weightlifting", "Yoga", "Dance", "Team sports", "Other"]}
                  selectedValues={typedData.exercises || []}
                  onChange={(value) => {
                    const currentExercises = typedData.exercises || []
                    const newExercises = currentExercises.includes(value)
                      ? currentExercises.filter(ex => ex !== value)
                      : [...currentExercises, value]
                    setData({ ...typedData, exercises: newExercises })
                  }}
                />
                {typedData.exercises?.includes("Other") && (
                  <Input
                    placeholder="Add custom exercise"
                    value={typedData.customExercise ?? ""}
                    onChange={(e) => setData({ ...typedData, customExercise: e.target.value })}
                    className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
                    style={{ height: "44px", fontSize: "15px" }}
                  />
                )}
              </div>
            ), 1)}
            {renderField("Exercise Frequency", (
              <Select
                value={typedData.exerciseFrequency}
                onValueChange={(value: "0" | "1-2" | "3-4" | "5+") => setData({ ...typedData, exerciseFrequency: value })}
              >
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1-2">1-2</SelectItem>
                  <SelectItem value="3-4">3-4</SelectItem>
                  <SelectItem value="5+">5+</SelectItem>
                </SelectContent>
              </Select>
            ), 2)}
            {renderField("Session Length", (
              <Select
                value={typedData.sessionLength}
                onValueChange={(value: "Less than 15 minutes" | "15-30 minutes" | "30-45 minutes" | "45-60 minutes" | "More than 60 minutes") => setData({ ...typedData, sessionLength: value })}
              >
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Less than 15 minutes">Less than 15 minutes</SelectItem>
                  <SelectItem value="15-30 minutes">15-30 minutes</SelectItem>
                  <SelectItem value="30-45 minutes">30-45 minutes</SelectItem>
                  <SelectItem value="45-60 minutes">45-60 minutes</SelectItem>
                  <SelectItem value="More than 60 minutes">More than 60 minutes</SelectItem>
                </SelectContent>
              </Select>
            ), 3)}
          </>
        )
      }

      case "goals": {
        const typedData = safeData as FormData["goals"]
        return (
          <>
            {renderField("Fitness Goals", (
              <MultiSelectPills
                options={["Weight loss", "Muscle gain", "Improve endurance", "Increase flexibility", "Tone muscles"]}
                selectedValues={typedData.fitnessGoals || []}
                onChange={(value) => {
                  const currentGoals = typedData.fitnessGoals || []
                  const newGoals = currentGoals.includes(value)
                    ? currentGoals.filter(goal => goal !== value)
                    : [...currentGoals, value]
                  setData({ ...typedData, fitnessGoals: newGoals })
                }}
              />
            ), 0)}
            {renderField("Goal Timeline", (
              <Select
                value={typedData.goalTimeline}
                onValueChange={(value: "1-3 months" | "3-6 months" | "6-12 months" | "More than a year") => setData({ ...typedData, goalTimeline: value })}
              >
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3 months">1-3 months</SelectItem>
                  <SelectItem value="3-6 months">3-6 months</SelectItem>
                  <SelectItem value="6-12 months">6-12 months</SelectItem>
                  <SelectItem value="More than a year">More than a year</SelectItem>
                </SelectContent>
              </Select>
            ), 1)}
            {renderField("Specific Goals (Optional)", (
              <Textarea
                id="specificGoals"
                value={typedData.specificGoals}
                onChange={(e) => setData({ ...typedData, specificGoals: e.target.value })}
                placeholder="Describe your specific goals..."
                className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[100px] text-[15px]"
              />
            ), 2)}
          </>
        )
      }

      case "healthCons": {
        const typedData = safeData as FormData["healthCons"]
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label>Injuries</Label>
                <RadioGroup
                  value={typedData.injuries ? "true" : "false"}
                  onValueChange={(value) => setData({ ...typedData, injuries: value === "true" })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="injuries-yes" />
                    <Label htmlFor="injuries-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="injuries-no" />
                    <Label htmlFor="injuries-no">No</Label>
                  </div>
                </RadioGroup>
                {typedData.injuries && (
                  <div className="mt-2">
                    <Textarea
                      placeholder="Describe your injuries..."
                      value={typedData.injuriesDetails ?? ""}
                      onChange={(e) => setData({ ...typedData, injuriesDetails: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <div>
                <Label>Recent Surgery</Label>
                <RadioGroup
                  value={typedData.recentSurgery ? "true" : "false"}
                  onValueChange={(value) => setData({ ...typedData, recentSurgery: value === "true" })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="surgery-yes" />
                    <Label htmlFor="surgery-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="surgery-no" />
                    <Label htmlFor="surgery-no">No</Label>
                  </div>
                </RadioGroup>
                {typedData.recentSurgery && (
                  <div className="mt-2">
                    <Textarea
                      placeholder="Describe your surgery and recovery timeline..."
                      value={typedData.surgeryDetails ?? ""}
                      onChange={(e) => setData({ ...typedData, surgeryDetails: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <div>
                <Label>Chronic Conditions</Label>
                <MultiSelectPills
                  options={["None", "Diabetes", "Hypertension", "Asthma", "Arthritis", "Other"]}
                  selectedValues={typedData.chronicConditions || []}
                  onChange={(value) => {
                    const currentConditions = typedData.chronicConditions || []
                    const newConditions = currentConditions.includes(value)
                      ? currentConditions.filter(condition => condition !== value)
                      : [...currentConditions, value]
                    setData({ ...typedData, chronicConditions: newConditions })
                  }}
                />
                {typedData.chronicConditions?.includes("Other") && (
                  <div className="mt-2">
                    <Input
                      placeholder="Add custom condition"
                      value={typedData.otherHealthConditions?.[0] ?? ""}
                      onChange={(e) => setData({ ...typedData, otherHealthConditions: [e.target.value] })}
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="pregnancy">Pregnancy Status</Label>
                <Select
                  value={typedData.pregnancy}
                  onValueChange={(value: "Not applicable" | "Pregnant" | "Postpartum (0-6 months)" | "Postpartum (6-12 months)") => setData({ ...typedData, pregnancy: value })}
                >
                  <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not applicable">Not applicable</SelectItem>
                    <SelectItem value="Pregnant">Pregnant</SelectItem>
                    <SelectItem value="Postpartum (0-6 months)">Postpartum (0-6 months)</SelectItem>
                    <SelectItem value="Postpartum (6-12 months)">Postpartum (6-12 months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )
      }

      case "pilates": {
        const typedData = safeData as FormData["pilates"]
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label>Pilates Experience</Label>
                <RadioGroup
                  value={typedData.pilatesExperience ? "true" : "false"}
                  onValueChange={(value) => setData({ ...typedData, pilatesExperience: value === "true" })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="pilates-yes" />
                    <Label htmlFor="pilates-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="pilates-no" />
                    <Label htmlFor="pilates-no">No</Label>
                  </div>
                </RadioGroup>
                {typedData.pilatesExperience && (
                  <div className="mt-2">
                    <Label htmlFor="pilatesDuration">Duration</Label>
                    <Select
                      value={typedData.pilatesDuration}
                      onValueChange={(value: "Less than 3 months" | "3-6 months" | "6-12 months" | "1-3 years" | "More than 3 years") => setData({ ...typedData, pilatesDuration: value })}
                    >
                      <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Less than 3 months">Less than 3 months</SelectItem>
                        <SelectItem value="3-6 months">3-6 months</SelectItem>
                        <SelectItem value="6-12 months">6-12 months</SelectItem>
                        <SelectItem value="1-3 years">1-3 years</SelectItem>
                        <SelectItem value="More than 3 years">More than 3 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="studioFrequency">Studio Frequency</Label>
                <Select
                  value={typedData.studioFrequency}
                  onValueChange={(value: "Never" | "1-2 times per month" | "1 time per week" | "2-3 times per week" | "4+ times per week") => setData({ ...typedData, studioFrequency: value })}
                >
                  <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Never">Never</SelectItem>
                    <SelectItem value="1-2 times per month">1-2 times per month</SelectItem>
                    <SelectItem value="1 time per week">1 time per week</SelectItem>
                    <SelectItem value="2-3 times per week">2-3 times per week</SelectItem>
                    <SelectItem value="4+ times per week">4+ times per week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sessionPreference">Session Preference</Label>
                <Select
                  value={typedData.sessionPreference}
                  onValueChange={(value: "Group classes" | "Private sessions" | "Both" | "No preference") => setData({ ...typedData, sessionPreference: value })}
                >
                  <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Group classes">Group classes</SelectItem>
                    <SelectItem value="Private sessions">Private sessions</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                    <SelectItem value="No preference">No preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Instructors</Label>
                <MultiSelectPills
                  options={["None yet"]}
                  selectedValues={typedData.instructors || []}
                  onChange={(value) => {
                    const currentInstructors = typedData.instructors || []
                    const newInstructors = currentInstructors.includes(value)
                      ? currentInstructors.filter(i => i !== value)
                      : [...currentInstructors, value]
                    setData({ ...typedData, instructors: newInstructors })
                  }}
                />
                <div className="mt-2">
                  <Input
                    placeholder="Add instructor name"
                    value={typedData.customInstructor ?? ""}
                    onChange={(e) => setData({ ...typedData, customInstructor: e.target.value })}
                    className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
                    style={{ height: "44px", fontSize: "15px" }}
                  />
                </div>
              </div>
              <div>
                <Label>Apparatus Preference</Label>
                <MultiSelectPills
                  options={["Reformer", "Cadillac", "Chair", "Barrel", "Tower", "Mat work only", "Not sure yet"]}
                  selectedValues={typedData.apparatusPreference || []}
                  onChange={(value) => {
                    const currentPreference = typedData.apparatusPreference || []
                    const newPreference = currentPreference.includes(value)
                      ? currentPreference.filter(p => p !== value)
                      : [...currentPreference, value]
                    setData({ ...typedData, apparatusPreference: newPreference })
                  }}
                />
                <div className="mt-2">
                  <Input
                    placeholder="Add custom apparatus"
                    value={typedData.customApparatus ?? ""}
                    onChange={(e) => setData({ ...typedData, customApparatus: e.target.value })}
                    className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
                    style={{ height: "44px", fontSize: "15px" }}
                  />
                </div>
              </div>
            </div>
          </>
        )
      }

      case "motivation": {
        const typedData = safeData as FormData["motivation"]
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label>Motivation Factors</Label>
                <MultiSelectPills
                  options={["Health improvement", "Weight management", "Stress relief", "Social connection", "Other"]}
                  selectedValues={typedData.motivation || []}
                  onChange={(value) => {
                    const currentMotivation = typedData.motivation || []
                    const newMotivation = currentMotivation.includes(value)
                      ? currentMotivation.filter(m => m !== value)
                      : [...currentMotivation, value]
                    setData({ ...typedData, motivation: newMotivation })
                  }}
                />
                {typedData.motivation?.includes("Other") && (
                  <div className="mt-2">
                    <Input
                      placeholder="Add custom motivation"
                      value={typedData.otherMotivation?.[0] ?? ""}
                      onChange={(e) => setData({ ...typedData, otherMotivation: [e.target.value] })}
                    />
                  </div>
                )}
              </div>
              <div>
                <Label>Progress Tracking Methods</Label>
                <MultiSelectPills
                  options={["Photos", "Measurements", "Workout logs", "App tracking", "Other"]}
                  selectedValues={typedData.progressTracking || []}
                  onChange={(value) => {
                    const currentTracking = typedData.progressTracking || []
                    const newTracking = currentTracking.includes(value)
                      ? currentTracking.filter(t => t !== value)
                      : [...currentTracking, value]
                    setData({ ...typedData, progressTracking: newTracking })
                  }}
                />
                {typedData.progressTracking?.includes("Other") && (
                  <div className="mt-2">
                    <Input
                      placeholder="Add custom tracking method"
                      value={typedData.otherProgressTracking?.[0] ?? ""}
                      onChange={(e) => setData({ ...typedData, otherProgressTracking: [e.target.value] })}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )
      }

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-0 shadow-xl p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <DialogTitle className="text-xl font-semibold" style={{ color: formSections.find((section) => section.type === formType)?.color ?? "#007AFF" }}>
              {formSections.find((section) => section.type === formType)?.title}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderFormFields()}
            </motion.div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                className="w-full rounded-xl h-11 text-white transition-all"
                style={{
                  backgroundColor: formSections.find((section) => section.type === formType)?.color ?? "#007AFF",
                  boxShadow: `0 2px 10px ${formSections.find((section) => section.type === formType)?.color ?? "#007AFF"}40`,
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
