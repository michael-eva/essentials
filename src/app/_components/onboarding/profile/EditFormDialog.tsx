"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";
import { FitnessBackgroundProfileSection } from "@/app/_components/onboarding/profile/FitnessBackgroundProfileSection";

import { type PregnancyOption } from "@/app/_constants/health";
import { type Gender } from "@/app/_constants/gender";
import {
  DEFAULT_EXERCISE_OPTIONS,
  EXERCISE_FREQUENCY,
  FITNESS_LEVEL,
  SESSION_LENGTH,
  type ExerciseFrequency,
  type FitnessLevel,
  type SessionLength,
} from "@/app/_constants/fitness";
import {
  GOAL_TIMELINE,
  GOALS,
  type GoalTimeline,
} from "@/app/_constants/goals";
import {
  type CustomPilateApparatus,
  type PilatesApparatus,
  type PilatesDuration,
  type PilatesSessionPreference,
  type PilatesSessions,
} from "@/app/_constants/pilates";
import {
  type MotivationFactor,
  type ProgressTrackingMethod,
} from "@/app/_constants/motivation";
import HealthConsiderationProfileSection from "@/app/_components/onboarding/profile/HealthConsiderationProfileSection";
import PilatesProfileSection from "@/app/_components/onboarding/profile/PilatesProfileSection";
import MotivationProfileSection from "./MotivationProfileSection";
import { FitnessGoalsProfileSection } from "./FitnessGoalsProfileSection";
import BasicQuestionsProfileSection from "./PersonalInfoProfileSection";

type FormType =
  | "basicQuestion"
  | "fitnessBg"
  | "goals"
  | "healthCons"
  | "pilates"
  | "motivation";

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
    otherExercises: string[];
  };
  goals: {
    fitnessGoals: string[];
    goalTimeline: GoalTimeline | null;
    specificGoals: string | null;
    otherFitnessGoals: string[];
  };
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
    pilatesExperience: boolean | null;
    pilatesDuration: PilatesDuration | null;
    studioFrequency: PilatesSessions | null;
    sessionPreference: PilatesSessionPreference | null;
    apparatusPreference: PilatesApparatus[];
    otherApparatusPreferences: string[],
    customApparatus: CustomPilateApparatus[];
    otherCustomApparatus: string[]
  };
}

interface EditFormDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  formType: FormType;
  formData: FormData[FormType];
  onSubmitAction: (data: FormData[FormType]) => void;
  formSections: Array<{
    type: FormType;
    title: string;
    description: string;
    icon: React.ReactNode;
    completion: number;
    color: string;
  }>;
}

export default function EditFormDialog({
  open,
  onOpenChangeAction,
  formType,
  formData,
  onSubmitAction,
  formSections,
}: EditFormDialogProps) {
  const [data, setData] = useState<FormData[FormType]>(() => {
    // Initialize with default values based on form type
    switch (formType) {
      case "basicQuestion":
        return {
          name: null,
          age: null,
          height: null,
          weight: null,
          gender: null,
        } as FormData["basicQuestion"];
      case "fitnessBg":
        return {
          fitnessLevel: null,
          exercises: [],
          exerciseFrequency: null,
          sessionLength: null,
          customExercise: null,
          otherExercises: [],
        } as FormData["fitnessBg"];
      case "goals":
        return {
          fitnessGoals: [],
          goalTimeline: null,
          specificGoals: null,
          otherFitnessGoals: [],
        } as FormData["goals"];
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
          pregnancyConsultedDoctorDetails: null,
        } as FormData["healthCons"];
      case "pilates":
        return {
          pilatesExperience: null,
          pilatesDuration: null,
          studioFrequency: null,
          sessionPreference: null,
          // instructors: [],
          // customInstructor: null,
          apparatusPreference: [],
          otherApparatusPreferences: [],
          customApparatus: [],
          otherCustomApparatus: []
        } as FormData["pilates"];
      case "motivation":
        return {
          motivation: [],
          progressTracking: [],
          otherMotivation: [],
          otherProgressTracking: [],
        } as FormData["motivation"];
      default:
        return {} as FormData[FormType];
    }
  });

  useEffect(() => {
    if (formData) {
      setData(formData);
    }
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let submitData = data;
    // Type guard for healthCons form
    if (
      formType === "healthCons" &&
      (data as FormData["healthCons"]).pregnancyConsultedDoctor === false
    ) {
      submitData = {
        ...data,
        pregnancyConsultedDoctorDetails: null,
      };
    }
    onSubmitAction(submitData);
  };

  const renderFormFields = () => {
    // Ensure we have valid data for the current form type
    const safeData =
      data ||
      ({
        basicQuestion: {
          name: null,
          age: null,
          height: null,
          weight: null,
          gender: null,
        },
        fitnessBg: {
          fitnessLevel: null,
          exercises: [],
          exerciseFrequency: null,
          sessionLength: null,
          customExercise: null,
          otherExercises: [],
        },
        goals: {
          fitnessGoals: [],
          goalTimeline: null,
          specificGoals: null,
        },
        healthCons: {
          injuries: null,
          recentSurgery: null,
          chronicConditions: [],
          pregnancy: null,
          injuriesDetails: null,
          surgeryDetails: null,
          otherHealthConditions: [],
        },
        pilates: {
          pilatesExperience: null,
          pilatesDuration: null,
          studioFrequency: null,
          sessionPreference: null,
          instructors: [],
          customInstructor: null,
          apparatusPreference: [],
          customApparatus: [],
        },
        motivation: {
          motivation: [],
          progressTracking: [],
          otherMotivation: [],
          otherProgressTracking: [],
        },
      }[formType] as FormData[FormType]);

    switch (formType) {
      case "basicQuestion": {
        const typedData = safeData as FormData["basicQuestion"];
        return (
          <BasicQuestionsProfileSection
            typedData={typedData}
            setData={setData}
          />
        );
      }

      case "fitnessBg": {
        const typedData = safeData as FormData["fitnessBg"];
        return (
          <FitnessBackgroundProfileSection
            typedData={typedData}
            setData={setData}
            FITNESS_LEVEL={FITNESS_LEVEL}
            DEFAULT_EXERCISE_OPTIONS={DEFAULT_EXERCISE_OPTIONS}
            EXERCISE_FREQUENCY={EXERCISE_FREQUENCY}
            SESSION_LENGTH={SESSION_LENGTH}
          />
        );
      }

      case "goals": {
        const typedData = safeData as FormData["goals"];
        return (
          <FitnessGoalsProfileSection
            typedData={typedData}
            setData={setData}
            GOALS={GOALS}
            GOAL_TIMELINE={GOAL_TIMELINE}
          />
        );
      }

      case "healthCons": {
        const typedData = safeData as FormData["healthCons"];
        return (
          <HealthConsiderationProfileSection
            data={typedData}
            setData={setData}
          />
        );
      }

      case "pilates": {
        const typedData = safeData as FormData["pilates"];

        return <PilatesProfileSection data={typedData} setData={setData} />;
      }

      case "motivation": {
        const typedData = safeData as FormData["motivation"];

        return (
          <MotivationProfileSection typedData={typedData} setData={setData} />
        );
      }

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="overflow-hidden rounded-2xl border-0 p-0 shadow-xl sm:max-w-[425px]">
        <div className="p-6">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <DialogTitle
              className="text-xl font-semibold"
              style={{
                color:
                  formSections.find((section) => section.type === formType)
                    ?.color ?? "#007AFF",
              }}
            >
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
                className="h-11 w-full rounded-xl text-white transition-all"
                style={{
                  backgroundColor:
                    formSections.find((section) => section.type === formType)
                      ?.color ?? "#007AFF",
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
  );
}
