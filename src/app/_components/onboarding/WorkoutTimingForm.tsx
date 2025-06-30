import { useState } from "react";
import { STEPS } from "@/app/onboarding/constants";
import FormLayout from "./FormLayout";
import { Label } from "@/components/ui/label";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { SECTION_LABELS } from "@/app/_constants/ui-labels";

const TIME_OPTIONS = [
  "Early Morning",
  "Mid Morning",
  "Lunchtime",
  "Afternoon",
  "Evening",
  "Other",
];

const WEEKEND_OPTIONS = ["No", "Sometimes", "Saturday", "Sunday", "Both"];

interface WorkoutTimingFormProps {
  isFirstStep?: boolean;
  isLastStep?: boolean;
  currentStep: (typeof STEPS)[number];
}

// Plan. 

export default function WorkoutTimingForm(props: WorkoutTimingFormProps) {
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const [avoidTimes, setAvoidTimes] = useState<string[]>([]);
  const [weekendPrefs, setWeekendPrefs] = useState<string[]>([]);

  return (
    <FormLayout {...props} onSubmit={async () => true}>
      <form className="mx-auto max-w-md space-y-8 px-2">
        <h2 className="text-2xl font-bold text-gray-900">
          {SECTION_LABELS.WORKOUT_TIMING.TITLE}
        </h2>

        <div className="space-y-8">
          <div>
            <label
              htmlFor="workout-level"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              What time of day is best for you to work out?
            </label>{" "}
            <MultiSelectPills
              options={TIME_OPTIONS}
              selectedValues={preferredTimes}
              onChange={(value) => {
                setPreferredTimes((prev) =>
                  prev.includes(value)
                    ? prev.filter((v) => v !== value)
                    : [...prev, value],
                );
              }}
            />
          </div>

          <div>
            <Label>Are there times you prefer not to work out?</Label>
            <MultiSelectPills
              options={TIME_OPTIONS}
              selectedValues={avoidTimes}
              onChange={(value) => {
                setAvoidTimes((prev) =>
                  prev.includes(value)
                    ? prev.filter((v) => v !== value)
                    : [...prev, value],
                );
              }}
            />
          </div>

          <div>
            <Label>Do you usually work out on weekends?</Label>
            <MultiSelectPills
              options={WEEKEND_OPTIONS}
              selectedValues={weekendPrefs}
              onChange={(value) => {
                setWeekendPrefs((prev) =>
                  prev.includes(value)
                    ? prev.filter((v) => v !== value)
                    : [...prev, value],
                );
              }}
            />
          </div>
        </div>
      </form>
    </FormLayout>
  );
}
