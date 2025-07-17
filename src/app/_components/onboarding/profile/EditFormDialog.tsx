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

import type { FormData } from "@/hooks/useProfileCompletion";

import HealthConsiderationProfileSection from "@/app/_components/onboarding/profile/HealthConsiderationProfileSection";
import PilatesProfileSection from "@/app/_components/onboarding/profile/PilatesProfileSection";
import MotivationProfileSection from "./MotivationProfileSection";

type FormType =
  | "healthCons"
  | "pilates"
  | "motivation";

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
          fitnessLevel: null,
          pilatesExperience: null,
          pilatesDuration: null,
          pilatesStyles: [],
          homeEquipment: [],
          fitnessGoals: [],
          otherFitnessGoals: [],
          specificGoals: null,
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
        healthCons: {
          injuries: null,
          injuriesDetails: null,
          recentSurgery: null,
          surgeryDetails: null,
          chronicConditions: [],
          otherHealthConditions: [],
          pregnancy: null,
          pregnancyConsultedDoctor: null,
          pregnancyConsultedDoctorDetails: null,
        },
        pilates: {
          fitnessLevel: null,
          pilatesExperience: null,
          pilatesDuration: null,
          pilatesStyles: [],
          homeEquipment: [],
          fitnessGoals: [],
          otherFitnessGoals: [],
          specificGoals: null,
        },
        motivation: {
          motivation: [],
          progressTracking: [],
          otherMotivation: [],
          otherProgressTracking: [],
        },
      }[formType] as FormData[FormType]);

    switch (formType) {
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
