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
      <DialogContent 
        className="overflow-hidden rounded-2xl border-0 p-0 shadow-xl sm:max-w-[480px] max-h-[90vh] flex flex-col"
        onInteractOutside={(e) => {
          // Prevent dialog from closing when clicking on Select dropdown elements
          const target = e.target as Element;
          if (target?.closest('[data-radix-select-content]') || 
              target?.closest('[data-radix-select-viewport]') ||
              target?.closest('[data-radix-popper-content-wrapper]')) {
            e.preventDefault();
          }
        }}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 rounded-t-2xl">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{
                  backgroundColor: formSections.find((section) => section.type === formType)?.color ?? "#007AFF",
                }}
              >
                {formSections.find((section) => section.type === formType)?.icon}
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  {formSections.find((section) => section.type === formType)?.title}
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {formSections.find((section) => section.type === formType)?.description}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              {renderFormFields()}
            </motion.div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white rounded-b-2xl">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChangeAction(false)}
                className="flex-1 h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 rounded-xl text-white transition-all hover:opacity-90"
                style={{
                  backgroundColor: formSections.find((section) => section.type === formType)?.color ?? "#007AFF",
                  boxShadow: `0 2px 12px ${formSections.find((section) => section.type === formType)?.color ?? "#007AFF"}30`,
                }}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
