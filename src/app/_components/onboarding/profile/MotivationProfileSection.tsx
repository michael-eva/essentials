import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import {
  MOTIVATION_FACTORS,
  PROGRESS_TRACKING_METHODS,
} from "@/app/_constants/motivation";
import type { FormData } from "@/app/_components/onboarding/profile/EditFormDialog";
import { CustomOtherInput } from "@/app/_components/onboarding/profile/CustomOtherInput"

type MotivationProfileSectionProps = {
  typedData: FormData["motivation"];
  setData: (data: FormData["motivation"]) => void;
};

export default function MotivationProfileSection({
  typedData,
  setData,
}: MotivationProfileSectionProps) {
  // Local state for new custom tracking method input
  // No local state needed here; handled in CustomOtherInput

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-2">Motivation Factors</Label>
        <MultiSelectPills
          options={MOTIVATION_FACTORS}
          selectedValues={typedData.motivation}
          onChange={(value) => {
            const currentMotivation = typedData.motivation;
            const newMotivationArr = currentMotivation.includes(value)
              ? currentMotivation.filter((m) => m !== value)
              : [...currentMotivation, value];
            setData({ ...typedData, motivation: newMotivationArr });
          }}
        />
        {typedData.motivation.includes("Other") && (
          <div className="mt-2">
            <CustomOtherInput
              placeholder="Add custom motivation"
              items={typedData.otherMotivation || []}
              onAdd={(item) =>
                setData({
                  ...typedData,
                  otherMotivation: [...(typedData.otherMotivation || []), item],
                })
              }
              onRemove={(idx) =>
                setData({
                  ...typedData,
                  otherMotivation: (typedData.otherMotivation || []).filter(
                    (_, i) => i !== idx,
                  ),
                })
              }
            />
          </div>
        )}
      </div>
      <div>
        <Label className="mb-2">Progress Tracking Methods</Label>
        <MultiSelectPills
          options={PROGRESS_TRACKING_METHODS}
          selectedValues={typedData.progressTracking}
          onChange={(value) => {
            const currentTracking = typedData.progressTracking;
            const newTracking = currentTracking.includes(value)
              ? currentTracking.filter((t) => t !== value)
              : [...currentTracking, value];
            setData({ ...typedData, progressTracking: newTracking });
          }}
        />
        {typedData.progressTracking.includes("Other") && (
          <div className="mt-2">
            <CustomOtherInput
              placeholder="Add custom tracking method"
              items={typedData.otherProgressTracking}
              onAdd={(item) =>
                setData({
                  ...typedData,
                  otherProgressTracking: [
                    ...typedData.otherProgressTracking,
                    item,
                  ],
                })
              }
              onRemove={(idx) =>
                setData({
                  ...typedData,
                  otherProgressTracking: typedData.otherProgressTracking.filter(
                    (_, i) => i !== idx,
                  ),
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
