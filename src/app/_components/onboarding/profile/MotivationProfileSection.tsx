import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { MOTIVATION_FACTORS, PROGRESS_TRACKING_METHODS } from "@/app/_constants/motivation";
import type { FormData } from "./EditFormDialog";

type MotivationProfileSectionProps = {
  typedData: FormData["motivation"];
  setData: (data: FormData['motivation']) => void
};

export default function MotivationProfileSection({ typedData, setData }: MotivationProfileSectionProps) {
  // Local state for new custom tracking method input
  const [newTracking, setNewTracking] = useState("");
  // Local state for new custom motivation input
  const [newMotivation, setNewMotivation] = useState("");

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
            <div className="flex gap-2">
              <Input
                placeholder="Add custom motivation"
                value={newMotivation}
                onChange={(e) => setNewMotivation(e.target.value)}
                className="flex-1"
              />
              <button
                type="button"
                className="bg-[#635BFF] text-white px-4 py-1 rounded"
                onClick={() => {
                  if (newMotivation.trim() !== "") {
                    setData({
                      ...typedData,
                      otherMotivation: [
                        ...(typedData.otherMotivation || []),
                        newMotivation.trim(),
                      ],
                    });
                    setNewMotivation("");
                  }
                }}
              >
                Add
              </button>
            </div>
            <div className="space-y-2 mt-2 text-sm">
              {(typedData.otherMotivation || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded"
                >
                  <span className="text-gray-700">{item}</span>
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => {
                      setData({
                        ...typedData,
                        otherMotivation: (typedData.otherMotivation || []).filter((_, i) => i !== idx),
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
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
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tracking method"
                value={newTracking}
                onChange={(e) => setNewTracking(e.target.value)}
                className="flex-1"
              />
              <button
                type="button"
                className="bg-[#635BFF] text-white px-4 py-1 rounded"
                onClick={() => {
                  if (newTracking.trim() !== "") {
                    setData({
                      ...typedData,
                      otherProgressTracking: [
                        ...typedData.otherProgressTracking,
                        newTracking.trim(),
                      ],
                    });
                    setNewTracking("");
                  }
                }}
              >
                Add
              </button>
            </div>
            <div className="space-y-2 mt-2 text-sm">
              {typedData.otherProgressTracking.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded"
                >
                  <span className="text-gray-700">{item}</span>
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => {
                      setData({
                        ...typedData,
                        otherProgressTracking: typedData.otherProgressTracking.filter((_, i) => i !== idx),
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 