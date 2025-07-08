import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { MOTIVATION_FACTORS, PROGRESS_TRACKING_METHODS } from "@/app/_constants/motivation";
import type { FormData } from "./EditFormDialog";
import type React from "react";

type MotivationProfileSectionProps = {
  typedData: FormData["motivation"];
  setData: React.Dispatch<React.SetStateAction<any>>;
};

export default function MotivationProfileSection({ typedData, setData }: MotivationProfileSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-2">Motivation Factors</Label>
        <MultiSelectPills
          options={MOTIVATION_FACTORS}
          selectedValues={typedData.motivation}
          onChange={(value) => {
            const currentMotivation = typedData.motivation;
            const newMotivation = currentMotivation.includes(value)
              ? currentMotivation.filter((m) => m !== value)
              : [...currentMotivation, value];
            setData({ ...typedData, motivation: newMotivation });
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
            <Input
              placeholder="Add custom tracking method"
              value={typedData.otherProgressTracking[0] ?? ""}
              onChange={(e) => setData({ ...typedData, otherProgressTracking: [e.target.value] })}
            />
          </div>
        )}
      </div>
    </div>
  );
} 