import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { AnimatedField } from "./AnimatedField";
import { CustomOtherInput } from "@/app/_components/onboarding/profile/CustomOtherInput";

import type { FormData } from "@/app/_components/onboarding/profile/EditFormDialog";
import type {
  ExerciseFrequency,
  FitnessLevel,
  SessionLength,
} from "@/app/_constants/fitness";

// Replace these with your actual types
interface FitnessBackgroundProfileSectionProps {
  typedData: FormData["fitnessBg"];
  setData: (data: FormData["fitnessBg"]) => void;
  FITNESS_LEVEL: readonly string[];
  DEFAULT_EXERCISE_OPTIONS: readonly string[];
  EXERCISE_FREQUENCY: readonly string[];
  SESSION_LENGTH: readonly string[];
}

export function FitnessBackgroundProfileSection({
  typedData,
  setData,
  FITNESS_LEVEL,
  DEFAULT_EXERCISE_OPTIONS,
  EXERCISE_FREQUENCY,
  SESSION_LENGTH,
}: FitnessBackgroundProfileSectionProps) {
  console.log("finess background", typedData);
  return (
    <>
      <AnimatedField label="Fitness Level" index={0}>
        <Select
          value={typedData.fitnessLevel ?? ""}
          onValueChange={(value: FitnessLevel) =>
            setData({ ...typedData, fitnessLevel: value })
          }
        >
          <SelectTrigger className="min-h-[44px] w-full rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            {FITNESS_LEVEL.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AnimatedField>
      <AnimatedField label="Exercises" index={1}>
        <div className="space-y-2">
          <MultiSelectPills
            options={[...DEFAULT_EXERCISE_OPTIONS]}
            selectedValues={typedData.exercises}
            onChange={(value) => {
              const currentExercises = typedData.exercises;
              const newExercises = currentExercises.includes(value)
                ? currentExercises.filter((ex: string) => ex !== value)
                : [...currentExercises, value];
              setData({ ...typedData, exercises: newExercises });
            }}
          />
          {typedData.exercises.includes("Other") && (
            <CustomOtherInput
              placeholder="Add custom exercise"
              items={typedData.otherExercises}
              onAdd={(item) =>
                setData({
                  ...typedData,
                  otherExercises: [...typedData.otherExercises, item],
                })
              }
              onRemove={(idx) =>
                setData({
                  ...typedData,
                  otherExercises: typedData.otherExercises.filter(
                    (_, i) => i !== idx,
                  ),
                })
              }
            />
          )}
        </div>
      </AnimatedField>
      <AnimatedField label="Exercise Frequency" index={2}>
        <Select
          value={typedData.exerciseFrequency ?? ""}
          onValueChange={(value: ExerciseFrequency) =>
            setData({ ...typedData, exerciseFrequency: value })
          }
        >
          <SelectTrigger className="min-h-[44px] w-full rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            {EXERCISE_FREQUENCY.map((frequency) => (
              <SelectItem key={frequency} value={frequency}>
                {frequency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AnimatedField>
      <AnimatedField label="Session Length" index={3}>
        <Select
          value={typedData.sessionLength ?? ""}
          onValueChange={(value: SessionLength) =>
            setData({ ...typedData, sessionLength: value })
          }
        >
          <SelectTrigger className="min-h-[44px] w-full rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0">
            <SelectValue placeholder="Select length" />
          </SelectTrigger>
          <SelectContent>
            {SESSION_LENGTH.map((length) => (
              <SelectItem key={length} value={length}>
                {length}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AnimatedField>
    </>
  );
}
