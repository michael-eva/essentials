import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Info } from "lucide-react";

// ============================================================================
// CONFIGURATION: Easy to modify questions and add new ones
// ============================================================================
// To add a new question:
// 1. Add the field to PlanPreferences interface
// 2. Add the field to the initial state in useState
// 3. Add the UI component in the render section
// 4. Update the prompt generation in useGeneratePlan hook
// ============================================================================
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

interface PlanPreferences {
  workoutDuration: number;
  classDuration: number;
  workoutClassRatio: number; // 0-100, percentage of workouts vs classes
  activitiesPerWeek: number; // How many activities per week
  additionalNotes: string;
  // Add new fields here as needed:
  // preferredDays?: string[];
  // intensityLevel?: 'beginner' | 'intermediate' | 'advanced';
  // focusAreas?: string[];
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
    workoutDuration: 30,
    classDuration: 30,
    workoutClassRatio: 50, // 50% workouts, 50% classes
    activitiesPerWeek: 3, // Default 3 activities per week
    additionalNotes: "",
    // Initialize new fields here:
    // preferredDays: [],
    // intensityLevel: 'beginner',
    // focusAreas: [],
  });

  const handleConfirm = () => {
    onNext(preferences);
  };

  const updatePreference = <K extends keyof PlanPreferences>(
    key: K,
    value: PlanPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const getWorkoutClassBreakdown = () => {
    const workoutPercentage = preferences.workoutClassRatio;
    const classPercentage = 100 - workoutPercentage;
    return {
      workouts: workoutPercentage,
      classes: classPercentage,
    };
  };

  const breakdown = getWorkoutClassBreakdown();

  return (
    <div className="space-y-6">
      {/* <div>
        <h3 className="text-lg font-semibold text-gray-900">Customize Your Workout Plan</h3>
        <p className="text-sm text-gray-500">Set your preferences for the generated plan</p>
      </div> */}

      <div className="space-y-6">
        {/* Activities Per Week */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Weekly Schedule</h3>

          <div className="space-y-3">
            <div >
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-gray-700" htmlFor="activities-per-week">
                  Activities per week
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="cursor-pointer text-gray-400 rounded-full p-1"
                      tabIndex={0}
                      aria-label="More info about activities per week"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="max-w-xs text-sm">
                    How many workouts and classes you&apos;d like to do each week.
                  </PopoverContent>
                </Popover>
              </div>
              <NumberSelector
                value={preferences.activitiesPerWeek}
                onChange={(value) => updatePreference('activitiesPerWeek', value)}
                min={1}
                max={7}
                step={1}
              />
            </div>
          </div>
        </div>
        {/* Duration Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Duration Settings</h3>

          <div className="space-y-3 flex justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Label htmlFor="workout-duration" className="text-sm font-medium text-gray-700">
                  Workout Duration
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="cursor-pointer text-gray-400 rounded-full p-1"
                      tabIndex={0}
                      aria-label="More info about workout duration"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="max-w-xs text-sm">
                    These are self-guided sessions (strength training, cardio, etc.) you&apos;ll do at home or the gym.
                  </PopoverContent>
                </Popover>
              </div>
              <span className="text-xs text-gray-500  mb-1">(minutes)</span>
              <NumberSelector
                value={preferences.workoutDuration}
                onChange={(value) => updatePreference('workoutDuration', value)}
                min={10}
                max={180}
                step={5}
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Label htmlFor="class-duration" className="text-sm font-medium text-gray-700">
                  Class Duration
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="cursor-pointer text-gray-400 rounded-full p-1"
                      tabIndex={0}
                      aria-label="More info about class duration"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="max-w-xs text-sm">
                    The length of your Pilates classes. These are instructor-led video sessions.
                  </PopoverContent>
                </Popover>
              </div>
              <span className="text-xs text-gray-500 mb-1">(minutes)</span>
              <NumberSelector
                value={preferences.classDuration}
                onChange={(value) => updatePreference('classDuration', value)}
                min={10}
                max={180}
                step={5}
              />

            </div>
          </div>
        </div>


        {/* Workout vs Class Distribution */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Workout vs Class Distribution</h3>
          <div className="bg-brand-light-nude rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Distribution:</div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">
                {breakdown.classes}% Classes
              </span>
              <span className="text-green-600">
                {breakdown.workouts}% Workouts
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">
              This will be used to balance your plan
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Balance between workouts and classes
              </Label>
              <div className="mt-2">
                <Slider
                  value={[preferences.workoutClassRatio]}
                  onValueChange={(value) => updatePreference('workoutClassRatio', value[0] ?? 50)}
                  max={100}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>More Classes</span>
                <span>More Workouts</span>
              </div>
            </div>


          </div>
        </div>

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

        {/* 
      ADD NEW QUESTIONS HERE
      Example:
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Preferred Days</h3>
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Which days work best for you?
          </Label>
          Add your UI component here
        </div>
      </div>
      */}
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