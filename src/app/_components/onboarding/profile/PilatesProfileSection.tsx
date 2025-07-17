import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import {
  PILATES_DURATION,
  PILATES_APPARATUS,
  type PilatesDuration,
  PILATES_STYLES,
} from "@/app/_constants/pilates";
import type { FormData } from "@/hooks/useProfileCompletion";

import { handleNoneMultiSelect } from "@/app/_utils/multiSelectNoneUtils";
import { CustomOtherInput } from "@/app/_components/onboarding/profile/CustomOtherInput";
import { FITNESS_LEVEL, type FitnessLevel } from "@/app/_constants/fitness";
import { GOALS } from "@/app/_constants/goals";
import { Textarea } from "@/components/ui/textarea";

type PilatesProfileSectionProps = {
  data: FormData["pilates"];
  setData: (data: FormData["pilates"]) => void;
};

const PilatesProfileSection: React.FC<PilatesProfileSectionProps> = ({
  data: typedData,
  setData,
}) => {
  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div>
        <Label className="mb-2">Fitness Level</Label>
        <Select
          value={typedData.fitnessLevel ?? ""}
          onValueChange={(value: FitnessLevel) =>
            setData({ ...typedData, fitnessLevel: value })
          }
        >
          <SelectTrigger className="min-h-[44px] w-full rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0">
            <SelectValue placeholder="Select fitness level" className="truncate" />
          </SelectTrigger>
          <SelectContent>
            {FITNESS_LEVEL.map((level) => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2">Pilates Experience</Label>
        <RadioGroup
          className="flex gap-6"
          value={
            typedData.pilatesExperience === null
              ? ""
              : typedData.pilatesExperience
                ? "true"
                : "false"
          }
          onValueChange={(value) =>
            setData({
              ...typedData,
              pilatesExperience: value === "" ? null : value === "true",
            })
          }
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
            <Label className="mb-2">Duration</Label>
            <Select
              value={typedData.pilatesDuration ?? ""}
              onValueChange={(value: PilatesDuration) =>
                setData({ ...typedData, pilatesDuration: value })
              }
            >
              <SelectTrigger className="min-h-[44px] w-full rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {PILATES_DURATION.map((duration) => (
                  <SelectItem key={duration} value={duration}>
                    {duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div>
        <Label className="mb-2">Type of Pilates</Label>
        <MultiSelectPills
          options={[...PILATES_STYLES]}
          selectedValues={typedData.pilatesStyles}
          onChange={(value) => {
            const newPreference = handleNoneMultiSelect(
              typedData.pilatesStyles,
              value,
            );
            setData({
              ...typedData,
              pilatesStyles: newPreference as typeof PILATES_STYLES[number][],
            });
          }}
        />
      </div>

      <div>
        <Label className="mb-2">Available Equipment</Label>
        <MultiSelectPills
          options={[...PILATES_APPARATUS]}
          selectedValues={typedData.homeEquipment}
          onChange={(value) => {
            const newPreference = handleNoneMultiSelect(
              typedData.homeEquipment,
              value,
            );

            setData({
              ...typedData,
              homeEquipment: newPreference as typeof PILATES_APPARATUS[number][],
            });
          }}
        />
      </div>

      <div>
        <Label className="mb-2">Fitness Goals</Label>
        <MultiSelectPills
          options={GOALS}
          selectedValues={typedData.fitnessGoals}
          onChange={(value) => {
            const currentGoals = typedData.fitnessGoals;
            const newGoals = currentGoals.includes(value)
              ? currentGoals.filter((g) => g !== value)
              : [...currentGoals, value];
            setData({
              ...typedData,
              fitnessGoals: newGoals,
            });
          }}
        />

        {typedData.fitnessGoals.includes("Other") && (
          <div className="mt-2">
            <CustomOtherInput
              placeholder="Add custom goals"
              items={typedData.otherFitnessGoals}
              onAdd={(item) =>
                setData({
                  ...typedData,
                  otherFitnessGoals: [
                    ...typedData.otherFitnessGoals,
                    item,
                  ],
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
          </div>
        )}
      </div>

      <div>
        <Label className="mb-2">Specific Goals</Label>
        <Textarea
          value={typedData.specificGoals ?? ""}
          onChange={(e) =>
            setData({
              ...typedData,
              specificGoals: e.target.value,
            })
          }
          placeholder="E.g., Run 5k, Lose 10kg, etc."
          className="min-h-[100px] w-full rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
        />
      </div>
    </div>
  );
};

export default PilatesProfileSection;
