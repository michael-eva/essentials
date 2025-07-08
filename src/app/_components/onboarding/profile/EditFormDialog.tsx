"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills"
import { Textarea } from "@/components/ui/textarea"
import { HEALTH_CONDITIONS, PREGNANCY_OPTIONS, type PregnancyOption } from "@/app/_constants/health"
import { GENDER, type Gender } from "@/app/_constants/gender"
import { DEFAULT_EXERCISE_OPTIONS, EXERCISE_FREQUENCY, FITNESS_LEVEL, SESSION_LENGTH, type ExerciseFrequency, type FitnessLevel, type SessionLength } from "@/app/_constants/fitness"
import { GOAL_TIMELINE, GOALS, type GoalTimeline } from "@/app/_constants/goals"
import { CUSTOM_PILATES_APPARATUS, PILATES_APPARATUS, PILATES_DURATION, PILATES_SESSION_PREFERENCE, PILATES_SESSIONS, type CustomPilateApparatus, type PilatesApparatus, type PilatesDuration, type PilatesSessionPreference, type PilatesSessions } from "@/app/_constants/pilates"
import { MOTIVATION_FACTORS, PROGRESS_TRACKING_METHODS, type MotivationFactor, type ProgressTrackingMethod } from "@/app/_constants/motivation"
import HealthConsiderationProfileSection from "@/app/_components/onboarding/profile/HealthConsiderationProfileSection";

type FormType = "basicQuestion" | "fitnessBg" | "goals" | "healthCons" | "pilates" | "motivation"

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
    chronicConditions: string[];
    otherHealthConditions: string[];
    pregnancy: PregnancyOption | null;
    pregnancyConsultedDoctor: boolean | null,
    pregnancyConsultedDoctorDetails: string | null
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
    apparatusPreference: PilatesApparatus[];
    customApparatus: CustomPilateApparatus[];
  };
}

interface EditFormDialogProps {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  formType: FormType
  formData: FormData[FormType]
  onSubmitAction: (data: FormData[FormType]) => void
  formSections: Array<{
    type: FormType
    title: string
    description: string
    icon: React.ReactNode
    completion: number
    color: string
  }>
}

export default function EditFormDialog({ open, onOpenChangeAction, formType, formData, onSubmitAction, formSections }: EditFormDialogProps) {
  const [data, setData] = useState<FormData[FormType]>(() => {
    // Initialize with default values based on form type
    switch (formType) {
      case "basicQuestion":
        return {
          name: null,
          age: null,
          height: null,
          weight: null,
          gender: null
        } as FormData["basicQuestion"]
      case "fitnessBg":
        return {
          fitnessLevel: null,
          exercises: [],
          exerciseFrequency: null,
          sessionLength: null,
          customExercise: null
        } as FormData["fitnessBg"]
      case "goals":
        return {
          fitnessGoals: [],
          goalTimeline: null,
          specificGoals: null
        } as FormData["goals"]
      case "healthCons":
        return {
          injuries: null,
          injuriesDetails: null,
          recentSurgery: null,
          surgeryDetails: null,
          chronicConditions: [],
          otherHealthConditions: [],
          pregnancy: null,
          pregnancyConsultedDoctor: null,
          pregnancyConsultedDoctorDetails: null
        } as FormData["healthCons"]
      case "pilates":
        return {
          pilatesExperience: null,
          pilatesDuration: null,
          studioFrequency: null,
          sessionPreference: null,
          // instructors: [],
          // customInstructor: null,
          apparatusPreference: [],
          customApparatus: []
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
    let submitData= data;
    // Type guard for healthCons form
    if (
      formType === "healthCons" &&
      (data as FormData["healthCons"]).pregnancyConsultedDoctor === false
    ) {
      submitData = {
        ...data,
        pregnancyConsultedDoctorDetails: null
      };
    }
    onSubmitAction(submitData)
  }

  const renderFormFields = () => {
    // Ensure we have valid data for the current form type
    const safeData = data || {
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
        injuries: null,
        recentSurgery: null,
        chronicConditions: [],
        pregnancy: null,
        injuriesDetails: null,
        surgeryDetails: null,
        otherHealthConditions: []
      },
      pilates: {
        pilatesExperience: null,
        pilatesDuration: null,
        studioFrequency: null,
        sessionPreference: null,
        instructors: [],
        customInstructor: null,
        apparatusPreference: [],
        customApparatus: []
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
        className="space-y-2 mb-4"
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
                value={typedData.name ?? ""}
                onChange={(e) => setData({ ...typedData, name: e.target.value || null })}
                className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
                style={{ height: "44px", fontSize: "15px" }}
              />
            ), 0)}
            {renderField("Age", (
              <Input
                id="age"
                type="number"
                value={typedData.age ?? ""}
                onChange={(e) => setData({ ...typedData, age: e.target.value ? parseInt(e.target.value) : null })}
                className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
                style={{ height: "44px", fontSize: "15px" }}
              />
            ), 1)}
            {renderField("Height (cm)", (
              <Input
                id="height"
                type="number"
                value={typedData.height ?? ""}
                onChange={(e) => setData({ ...typedData, height: e.target.value ? parseInt(e.target.value) : null })}
                className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
                style={{ height: "44px", fontSize: "15px" }}
              />
            ), 2)}
            {renderField("Weight (kg)", (
              <Input
                id="weight"
                type="number"
                value={typedData.weight ?? ""}
                onChange={(e) => setData({ ...typedData, weight: e.target.value ? parseInt(e.target.value) : null })}
                className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
                style={{ height: "44px", fontSize: "15px" }}
              />
            ), 3)}
            {renderField("Gender", (
              <Select
                value={typedData.gender ?? ""}
                onValueChange={(value: Gender) => setData({ ...typedData, gender: value })}
              >
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 w-full min-h-[44px]">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER.map((gender) => (
                    <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                  ))}
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
                value={typedData.fitnessLevel ?? ""}
                onValueChange={(value: FitnessLevel) => setData({ ...typedData, fitnessLevel: value })}
              >
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {FITNESS_LEVEL.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ), 0)}
            {renderField("Exercises", (
              <div className="space-y-2">
                <MultiSelectPills
                  options={DEFAULT_EXERCISE_OPTIONS}
                  selectedValues={typedData.exercises}
                  onChange={(value) => {
                    const currentExercises = typedData.exercises
                    const newExercises = currentExercises.includes(value)
                      ? currentExercises.filter(ex => ex !== value)
                      : [...currentExercises, value]
                    setData({ ...typedData, exercises: newExercises })
                  }}
                />
                {typedData.exercises.includes("Other") && (
                  <Input
                    placeholder="Add custom exercise"
                    value={typedData.customExercise ?? ""}
                    onChange={(e) => setData({ ...typedData, customExercise: e.target.value || null })}
                    className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
                    style={{ height: "44px", fontSize: "15px" }}
                  />
                )}
              </div>
            ), 1)}
            {renderField("Exercise Frequency", (
              <Select
                value={typedData.exerciseFrequency ?? ""}
                onValueChange={(value: ExerciseFrequency) => setData({ ...typedData, exerciseFrequency: value })}
              >
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {EXERCISE_FREQUENCY.map((frequency) => (
                    <SelectItem key={frequency} value={frequency}>{frequency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ), 2)}
            {renderField("Session Length", (
              <Select
                value={typedData.sessionLength ?? ""}
                onValueChange={(value: SessionLength) => setData({ ...typedData, sessionLength: value })}
              >
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_LENGTH.map((length) => (
                    <SelectItem key={length} value={length}>{length}</SelectItem>
                  ))}
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
                options={GOALS}
                selectedValues={typedData.fitnessGoals}
                onChange={(value) => {
                  const currentGoals = typedData.fitnessGoals
                  const newGoals = currentGoals.includes(value)
                    ? currentGoals.filter(goal => goal !== value)
                    : [...currentGoals, value]
                  setData({ ...typedData, fitnessGoals: newGoals })
                }}
              />
            ), 0)}
            {renderField("Goal Timeline", (
              <Select
                value={typedData.goalTimeline ?? ""}
                onValueChange={(value: GoalTimeline) => setData({ ...typedData, goalTimeline: value })}
              >
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_TIMELINE.map((timeline) => (
                    <SelectItem key={timeline} value={timeline}>{timeline}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ), 1)}
            {renderField("Specific Goals (Optional)", (
              <Textarea
                id="specificGoals"
                value={typedData.specificGoals ?? ""}
                onChange={(e) => setData({ ...typedData, specificGoals: e.target.value || null })}
                placeholder="Describe your specific goals..."
                className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[100px] text-[15px]"
              />
            ), 2)}
          </>
        )
      }

      case "healthCons": {
        const typedData = safeData as FormData["healthCons"];
        return (
          <HealthConsiderationProfileSection
            data={typedData}
            setData={(updated) => setData(updated as FormData["healthCons"])}
          />
        );
      }

      case "pilates": {
        const typedData = safeData as FormData["pilates"]
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label className="mb-2">Pilates Experience</Label>
                <RadioGroup 
                className="mb-4 flex gap-6"
                  value={typedData.pilatesExperience === null ? "" : typedData.pilatesExperience ? "true" : "false"}
                  onValueChange={(value) => setData({ ...typedData, pilatesExperience: value === "" ? null : value === "true" })}
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
                  <div className="mb-4">
                    <Label htmlFor="pilatesDuration" className="mb-2">Duration</Label>
                    <Select
                      value={typedData.pilatesDuration ?? ""}
                      onValueChange={(value: PilatesDuration) => setData({ ...typedData, pilatesDuration: value })}
                    >
                      <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {PILATES_DURATION.map((duration) => (
                          <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="studioFrequency" className="mb-2">Studio Frequency</Label>
                <Select
                  value={typedData.studioFrequency ?? ""}
                  onValueChange={(value: PilatesSessions) => setData({ ...typedData, studioFrequency: value })}
                >
                  <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {PILATES_SESSIONS.map((session) => (
                      <SelectItem key={session} value={session}>{session}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sessionPreference" className="mb-2">Preferred Class Type</Label>
                <Select
                  value={typedData.sessionPreference ?? ""}
                  onValueChange={(value: PilatesSessionPreference) => setData({ ...typedData, sessionPreference: value })}
                >
                  <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 min-h-[44px] w-full">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {PILATES_SESSION_PREFERENCE.map((preference) => (
                      <SelectItem key={preference} value={preference}>{preference}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2">Type of Pilates</Label>
                <MultiSelectPills
                  options={PILATES_APPARATUS}
                  selectedValues={typedData.apparatusPreference}
                  onChange={(value) => {
                    const currentPreference = typedData.apparatusPreference;
                    const newPreference = currentPreference.includes(value)
                      ? currentPreference.filter((p) => p !== value)
                      : [...currentPreference, value];
                    setData({
                      ...typedData,
                      apparatusPreference: newPreference,
                    });
                  }}
                />
               
              </div>
              <div>
                <Label className="mb-2">Available Equipment</Label>
                <MultiSelectPills
                  options={CUSTOM_PILATES_APPARATUS}
                  selectedValues={typedData.customApparatus}
                  onChange={(value) => {
                    const currentPreference = typedData.customApparatus;
                    const newPreference = currentPreference.includes(value)
                      ? currentPreference.filter((p) => p !== value)
                      : [...currentPreference, value];
                    setData({
                      ...typedData,
                      customApparatus: newPreference,
                    });
                  }}
                />
             
              </div>
            </div>
          </>
        );
      }

      case "motivation": {
        const typedData = safeData as FormData["motivation"]
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label>Motivation Factors</Label>
                <MultiSelectPills
                  options={MOTIVATION_FACTORS}
                  selectedValues={typedData.motivation}
                  onChange={(value) => {
                    const currentMotivation = typedData.motivation
                    const newMotivation = currentMotivation.includes(value)
                      ? currentMotivation.filter(m => m !== value)
                      : [...currentMotivation, value]
                    setData({ ...typedData, motivation: newMotivation })
                  }}
                />
                {typedData.motivation.includes("Other") && (
                  <div className="mt-2">
                    <Input
                      placeholder="Add custom motivation"
                      value={typedData.otherMotivation[0] ?? ""}
                      onChange={(e) => setData({ ...typedData, otherMotivation: [e.target.value] })}
                    />
                  </div>
                )}
              </div>
              <div>
                <Label>Progress Tracking Methods</Label>
                <MultiSelectPills
                  options={PROGRESS_TRACKING_METHODS}
                  selectedValues={typedData.progressTracking}
                  onChange={(value) => {
                    const currentTracking = typedData.progressTracking
                    const newTracking = currentTracking.includes(value)
                      ? currentTracking.filter(t => t !== value)
                      : [...currentTracking, value]
                    setData({ ...typedData, progressTracking: newTracking })
                  }}
                />
                {typedData.progressTracking.includes("Other") && (
                  <div className="mt-2">
                    <Input
                      placeholder="Add custom tracking method"
                      value={typedData.otherProgressTracking[0] ?? ""}
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
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
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
