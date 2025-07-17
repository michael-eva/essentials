import React from "react";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { GoalTimeline } from "@/app/_constants/goals";
import { AnimatedField } from "./AnimatedField";
import type { FormData } from "@/hooks/useProfileCompletion";
import { CustomOtherInput } from "@/app/_components/onboarding/profile/CustomOtherInput";

interface FitnessGoalsData {
  fitnessGoals: string[];
  otherFitnessGoals: string[];
  specificGoals: string | null;
  goalTimeline?: GoalTimeline | null;
}

interface FitnessGoalsProfileSectionProps {
  typedData: FitnessGoalsData;
  setData: (data: FitnessGoalsData) => void;
  GOALS: string[];
  GOAL_TIMELINE: readonly GoalTimeline[];
}

export function FitnessGoalsProfileSection({
  typedData,
  setData,
  GOALS,
  GOAL_TIMELINE,
}: FitnessGoalsProfileSectionProps) {
  console.log("itnessgoals", typedData);
  return (
    <>
      <AnimatedField label="Fitness Goals" index={0}>
        <div className="space-y-2">
          <MultiSelectPills
            options={GOALS}
            selectedValues={typedData.fitnessGoals}
            onChange={(value) => {
              const currentGoals = typedData.fitnessGoals;
              const newGoals = currentGoals.includes(value)
                ? currentGoals.filter((goal) => goal !== value)
                : [...currentGoals, value];
              setData({ ...typedData, fitnessGoals: newGoals });
            }}
          />

          {typedData.fitnessGoals.includes("Other") && (
            <CustomOtherInput
              placeholder="Add custom goals"
              items={typedData.otherFitnessGoals}
              onAdd={(item) =>
                setData({
                  ...typedData,
                  otherFitnessGoals: [...typedData.otherFitnessGoals, item],
                })
              }
              onRemove={(idx) =>
                setData({
                  ...typedData,
                  otherFitnessGoals: typedData.otherFitnessGoals.filter(
                    (_, i) => i !== idx,
                  ),
                })
              }
            />
          )}
        </div>
      </AnimatedField>
      <AnimatedField label="Goal Timeline" index={1}>
        <Select
          value={typedData.goalTimeline ?? ""}
          onValueChange={(value: GoalTimeline) =>
            setData({ ...typedData, goalTimeline: value })
          }
        >
          <SelectTrigger className="min-h-[44px] w-full rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0">
            <SelectValue placeholder="Select timeline" />
          </SelectTrigger>
          <SelectContent>
            {GOAL_TIMELINE.map((timeline) => (
              <SelectItem key={timeline} value={timeline}>
                {timeline}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AnimatedField>
      <AnimatedField label="Specific Goals (Optional)" index={2}>
        <Textarea
          id="specificGoals"
          value={typedData.specificGoals ?? ""}
          onChange={(e) =>
            setData({ ...typedData, specificGoals: e.target.value || null })
          }
          placeholder="Describe your specific goals..."
          className="min-h-[100px] rounded-xl border-gray-200 text-[15px] focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
        />
      </AnimatedField>
    </>
  );
}
