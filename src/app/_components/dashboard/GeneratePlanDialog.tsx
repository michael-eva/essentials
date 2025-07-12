import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import { cn } from "@/lib/utils";

const NumberSelector = ({ value, onChange, min, max, step }: { value: number, onChange: (value: number) => void, min: number, max: number, step: number }) => {
  return (
    <div className="flex items-center gap-3 mt-2">
      <Button type="button" variant="outline" size="sm" onClick={() => onChange(Math.max(min, value - step))} aria-label="Decrease value">
        -
      </Button>
      <span className="text-lg font-semibold w-12 text-center">{value}</span>
      <Button type="button" variant="outline" size="sm" onClick={() => onChange(Math.min(max, value + step))} aria-label="Increase value">
        +
      </Button>
    </div>
  );
};

type CardioType = "running" | "cycling" | "walking" | "swimming";
type PlanLength = "1 week" | "2 weeks" | "3 weeks" | "4 weeks" | "5 weeks" | "6 weeks" | "7 weeks" | "8 weeks" | "9 weeks" | "10 weeks";

export interface PlanPreferences {
  shortClassesPerWeek: number;
  mediumClassesPerWeek: number;
  longClassesPerWeek: number;
  additionalCardioWorkouts: string[];
  isCardioWorkout: boolean;
  cardioType: CardioType[];
  additionalNotes: string;
  shortWorkoutsPerWeek: number;
  mediumWorkoutsPerWeek: number;
  longWorkoutsPerWeek: number;
  planLength: PlanLength;
}

interface GeneratePlanFormProps {
  isSubmitting?: boolean;
  onNext: (preferences: PlanPreferences) => void;
  onPrevious: () => void;
}

const GeneratePlanForm: React.FC<GeneratePlanFormProps> = ({
  isSubmitting,
  onNext,
  onPrevious,
}) => {
  const [preferences, setPreferences] = useState<PlanPreferences>({
    shortClassesPerWeek: 1,
    mediumClassesPerWeek: 1,
    longClassesPerWeek: 1,
    additionalCardioWorkouts: [],
    additionalNotes: "",
    isCardioWorkout: false,
    cardioType: [],
    shortWorkoutsPerWeek: 1,
    mediumWorkoutsPerWeek: 1,
    longWorkoutsPerWeek: 1,
    planLength: "1 week",
  });

  const handleConfirm = () => {
    let finalPreferences = preferences;

    if (!preferences.isCardioWorkout) {
      finalPreferences = {
        ...preferences,
        cardioType: [],
        shortWorkoutsPerWeek: 0,
        mediumWorkoutsPerWeek: 0,
        longWorkoutsPerWeek: 0,
      };
    }

    onNext(finalPreferences);
  };

  const updatePreference = <K extends keyof PlanPreferences>(
    key: K,
    value: PlanPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6  w-full">
      <div className="space-y-6">
        {/* Activities Per Week */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Weekly Schedule</h3>

          <div className="space-y-3 flex flex-wrap justify-between">
            <div >
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-gray-700" htmlFor="activities-per-week">
                  Short Class
                </Label>
              </div>
              <span className="text-xs text-gray-500  mb-1">(10-20 minutes)</span>
              <NumberSelector
                value={preferences.shortClassesPerWeek}
                onChange={(value) => updatePreference('shortClassesPerWeek', value)}
                min={0}
                max={7}
                step={1}
              />
            </div>
            <div >
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-gray-700" htmlFor="activities-per-week">
                  Medium Class
                </Label>
              </div>
              <span className="text-xs text-gray-500  mb-1">(20-30 minutes)</span>
              <NumberSelector
                value={preferences.mediumClassesPerWeek}
                onChange={(value) => updatePreference('mediumClassesPerWeek', value)}
                min={0}
                max={7}
                step={1}
              />
            </div>
            <div >
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-gray-700" htmlFor="activities-per-week">
                  Long Class
                </Label>
              </div>
              <span className="text-xs text-gray-500  mb-1">(30+ minutes)</span>
              <NumberSelector
                value={preferences.longClassesPerWeek}
                onChange={(value) => updatePreference('longClassesPerWeek', value)}
                min={0}
                max={7}
                step={1}
              />
            </div>
          </div>
        </div>
        {/* Plan Length */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            How long would you like your plan to be?
          </Label>
          <MultiSelectPills
            options={["1 week", "2 weeks", "3 weeks", "4 weeks", "5 weeks", "6 weeks", "7 weeks", "8 weeks", "9 weeks", "10 weeks"]}
            selectedValues={[preferences.planLength]}
            onChange={(value) => updatePreference('planLength', value as PlanLength)}
          />
        </div>

        {/* Cardio Workout Preference */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Additional Cardio</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700">
                Would you like to include additional cardio workouts?
              </Label>
            </div>
            <div className="flex items-center gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => updatePreference('isCardioWorkout', true)} className={cn(preferences.isCardioWorkout && "bg-brand-brown text-white") + " w-1/2"}>Yes</Button>
              <Button variant="outline" size="sm" onClick={() => updatePreference('isCardioWorkout', false)} className={cn(!preferences.isCardioWorkout && "bg-brand-brown text-white") + " w-1/2"}>No</Button>
            </div>
          </div>
        </div>
        {preferences.isCardioWorkout && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              What types of cardio would you like to include?
            </Label>
            <MultiSelectPills
              options={["Running", "Cycling", "Walking", "Swimming"]}
              selectedValues={preferences.cardioType}
              onChange={(value) => {
                const currentValues = preferences.cardioType;
                const newValues = currentValues.includes(value as CardioType)
                  ? currentValues.filter(v => v !== value)
                  : [...currentValues, value as CardioType];
                updatePreference('cardioType', newValues);
              }}
            />
          </div>
        )}
        {preferences.cardioType.length > 0 && preferences.isCardioWorkout && <div className="space-y-3 flex flex-wrap justify-between">
          <div >
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700" htmlFor="activities-per-week">
                Short Workout
              </Label>
            </div>
            <span className="text-xs text-gray-500  mb-1">(10-20 minutes)</span>
            <NumberSelector
              value={preferences.shortWorkoutsPerWeek}
              onChange={(value) => updatePreference('shortWorkoutsPerWeek', value)}
              min={0}
              max={7}
              step={1}
            />
          </div>
          <div >
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700" htmlFor="activities-per-week">
                Medium Workout
              </Label>
            </div>
            <span className="text-xs text-gray-500  mb-1">(20-30 minutes)</span>
            <NumberSelector
              value={preferences.mediumWorkoutsPerWeek}
              onChange={(value) => updatePreference('mediumWorkoutsPerWeek', value)}
              min={0}
              max={7}
              step={1}
            />
          </div>
          <div >
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700" htmlFor="activities-per-week">
                Long Workout
              </Label>
            </div>
            <span className="text-xs text-gray-500  mb-1">(30+ minutes)</span>
            <NumberSelector
              value={preferences.longWorkoutsPerWeek}
              onChange={(value) => updatePreference('longWorkoutsPerWeek', value)}
              min={0}
              max={7}
              step={1}
            />
          </div>
        </div>}


        {/* Additional Notes */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Additional Preferences</h3>

          <div>
            <Label htmlFor="additional-notes" className="text-sm font-medium text-gray-700">
              Additional notes or preferences (optional)
            </Label>
            <Textarea
              id="additional-notes"
              placeholder="E.g., focus on core strength, avoid high-impact exercises..."
              value={preferences.additionalNotes}
              onChange={(e) => updatePreference('additionalNotes', e.target.value)}
              className="mt-2 resize-none"
              rows={3}
            />
          </div>
        </div>

      </div>

      <DialogFooter className="gap-2 sm:justify-center">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isSubmitting}
            className="w-1/2"
          >
            Previous
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-1/2"
          >
            {isSubmitting ? "Generating..." : "Generate Plan"}
          </Button>
        </div>
      </DialogFooter>
    </div>
  );
};

export default GeneratePlanForm; 