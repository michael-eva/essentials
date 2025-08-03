import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useEffect } from "react"
import { Clock, Ruler, Activity, Bike, Waves, Footprints, Mountain, Ship, Dumbbell, Ellipsis, LandPlot, Scaling, Weight, Anvil, CircleGauge, Repeat, Flame } from "lucide-react"
import { WheelPicker } from "./WheelPicker"
import { CustomInput } from "@/app/_components/dashboard/InputLayout"
import { DatePicker } from "@/components/ui/date-picker"
import { activityTypeEnum } from "@/drizzle/src/db/schema"
import { ExerciseList, type Exercise } from "./ExerciseList"

const exerciseSetSchema = z.object({
  id: z.string(),
  reps: z.number().min(1, "Reps must be at least 1"),
  weight: z.number().min(0, "Weight must be 0 or greater"),
})

const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Exercise name is required"),
  sets: z.array(exerciseSetSchema).min(1, "At least one set is required"),
})

const activityFormSchema = z.object({
  workoutType: z.enum(["run", "cycle", "swim", "walk", "class"], {
    required_error: "Please select an activity type",
  }),
  date: z.date(),
  durationHours: z.number().min(0, "Hours must be 0 or greater"),
  durationMinutes: z.number().min(0, "Minutes must be 0 or greater").max(59, "Minutes must be less than 60"),
  distance: z.string().optional(),
  distanceUnit: z.enum(["miles", "kilometers"], {
    required_error: "Please select a distance unit",
  }),
  intensity: z.number().min(1, "Please rate the intensity from 1-10").max(10, "Rating must be between 1-10"),
  notes: z.string().optional(),
  exercises: z.array(exerciseSchema).optional(),
  likelyToDoAgain: z.number().min(1, "Please rate the likelihood of doing this activity again from 1-10").max(10, "Rating must be between 1-10"),
})

export type ActivityFormValues = z.infer<typeof activityFormSchema>

const ACTIVITY_TYPES = activityTypeEnum.enumValues;

const ACTIVITY_ICONS = {
  run: Activity,
  cycle: Bike,
  swim: Waves,
  walk: Footprints,
  class: CircleGauge,
} as const;

function safeParseInt(val: string | undefined) {
  return /^\d+$/.test(val ?? "") ? parseInt(val!, 10) : 0;
}

export default function RecordManualActivity({
  isDialogOpen,
  setIsDialogOpen,
  handleSubmitActivity,
  initialActivityType,
  workoutId,
  initialDurationHours,
  initialDurationMinutes,
}: {
  isDialogOpen: boolean
  setIsDialogOpen: (isOpen: boolean) => void
  handleSubmitActivity: (data: ActivityFormValues, workoutId?: string) => void
  initialActivityType?: string
  workoutId?: string
  initialDurationHours?: number
  initialDurationMinutes?: number
}) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      workoutType: (initialActivityType && ["run", "cycle", "swim", "walk", "class"].includes(initialActivityType)) ? initialActivityType as "run" | "cycle" | "swim" | "walk" | "class" : undefined,
      date: new Date(),
      durationHours: initialDurationHours ?? 0,
      durationMinutes: initialDurationMinutes ?? 0,
      distance: "",
      distanceUnit: "kilometers",
      intensity: 5,
      notes: "",
      exercises: [],
      likelyToDoAgain: 5,
    },
  })

  useEffect(() => {
    if (initialActivityType && ["run", "cycle", "swim", "walk", "class"].includes(initialActivityType)) {
      form.setValue("workoutType", initialActivityType as "run" | "cycle" | "swim" | "walk" | "class")
    }
  }, [initialActivityType, form])

  useEffect(() => {
    if (initialDurationHours !== undefined) {
      form.setValue("durationHours", initialDurationHours)
      setTempHours(initialDurationHours)
    }
    if (initialDurationMinutes !== undefined) {
      form.setValue("durationMinutes", initialDurationMinutes)
      setTempMinutes(initialDurationMinutes)
    }
  }, [initialDurationHours, initialDurationMinutes, form])

  const onSubmit = (data: ActivityFormValues) => {
    handleSubmitActivity(data, workoutId)
    form.reset()
    setExercises([])
  }

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const [tempHours, setTempHours] = useState(form.watch("durationHours"))
  const [tempMinutes, setTempMinutes] = useState(form.watch("durationMinutes"))
  const [isDistancePickerOpen, setIsDistancePickerOpen] = useState(false)
  const distanceValue = form.watch("distance") ?? "0.0"
  const [intPart, decPart] = distanceValue.toString().split(".")
  const [tempDistanceInt, setTempDistanceInt] = useState(safeParseInt(intPart))
  const [tempDistanceDec, setTempDistanceDec] = useState(safeParseInt(decPart))
  const [tempDistanceUnit, setTempDistanceUnit] = useState(form.watch("distanceUnit") === "miles" ? "mi" : "km")

  const isCardioWorkout = ["run", "cycle", "swim", "walk"].includes(form.watch("workoutType") ?? "")

  const [exercises, setExercises] = useState<Exercise[]>(form.watch("exercises") ?? [])

  useEffect(() => {
    form.setValue("exercises", exercises)
  }, [exercises, form])

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Manual Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Activity Type</Label>
            <Select
              value={form.watch("workoutType")}
              onValueChange={(value) => form.setValue("workoutType", value as "run" | "cycle" | "swim" | "walk" | "class")}
            >
              <SelectTrigger className="flex items-center w-full border rounded-md px-3 py-2 text-left bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors gap-2">
                {!form.watch("workoutType") && <Activity className="w-4 h-4 text-muted-foreground" />}
                <span className="flex-1 text-left">
                  <SelectValue placeholder="Select activity type" />
                </span>
              </SelectTrigger>
              <SelectContent className="bg-brand-light-nude">
                {ACTIVITY_TYPES.map((type) => {
                  const IconComponent = ACTIVITY_ICONS[type];
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {form.formState.errors.workoutType && (
              <p className="text-sm text-destructive">{form.formState.errors.workoutType.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <DatePicker
              date={form.watch("date")}
              onSelect={(date) => form.setValue("date", date ?? new Date())}
              error={form.formState.errors.date?.message}
            />
          </div>
          <div className="space-y-2">
            <Label>Duration</Label>
            <CustomInput
              icon={Clock}
              value={form.watch("durationHours") === 0 && form.watch("durationMinutes") === 0 ? undefined : `${form.watch("durationHours")}h ${form.watch("durationMinutes").toString().padStart(2, '0')}m`}
              placeholder="Set duration"
              onClick={() => setIsTimePickerOpen(true)}
              error={form.formState.errors.durationHours?.message ?? form.formState.errors.durationMinutes?.message}
            />
          </div>

          <WheelPicker
            isOpen={isTimePickerOpen}
            onClose={() => {
              setIsTimePickerOpen(false)
              setTempHours(form.watch("durationHours"))
              setTempMinutes(form.watch("durationMinutes"))
            }}
            title="Select Duration"
            columns={[
              {
                label: "Hours",
                value: tempHours,
                setValue: setTempHours,
                min: 0,
                max: 24,
                format: (v) => v.toString(),
                unit: "h",
              },
              {
                label: "Minutes",
                value: tempMinutes,
                setValue: setTempMinutes,
                min: 0,
                max: 59,
                format: (v) => v.toString().padStart(2, '0'),
                unit: "m",
              },
            ]}
            onConfirm={() => {
              form.setValue("durationHours", tempHours)
              form.setValue("durationMinutes", tempMinutes)
              setIsTimePickerOpen(false)
            }}
          />

          {isCardioWorkout && (
            <>
              <div className="space-y-2">
                <Label>Distance</Label>
                <CustomInput
                  icon={Ruler}
                  value={form.watch("distance") ? `${form.watch("distance")}${form.watch("distanceUnit") === "miles" ? " mi" : " km"}` : undefined}
                  placeholder="Set distance"
                  onClick={() => setIsDistancePickerOpen(true)}
                  error={form.formState.errors.distance?.message}
                />
              </div>

              <WheelPicker
                isOpen={isDistancePickerOpen}
                onClose={() => {
                  setIsDistancePickerOpen(false)
                  const dVal = form.watch("distance") ?? "0.0"
                  const [intPart, decPart] = dVal.split(".")
                  setTempDistanceInt(safeParseInt(intPart))
                  setTempDistanceDec(safeParseInt(decPart))
                  setTempDistanceUnit(form.watch("distanceUnit") === "miles" ? "mi" : "km")
                }}
                title="Set Distance"
                columns={[
                  {
                    label: "",
                    value: tempDistanceInt,
                    setValue: setTempDistanceInt,
                    min: 0,
                    max: 99,
                    format: (v) => v.toString(),
                  },
                  {
                    label: "",
                    value: tempDistanceDec,
                    setValue: setTempDistanceDec,
                    min: 0,
                    max: 9,
                    format: (v) => "." + v.toString(),
                  },
                  {
                    label: "",
                    value: tempDistanceUnit,
                    setValue: (v: string) => setTempDistanceUnit(v as "km" | "mi"),
                    options: ["km", "mi"],
                  },
                ]}
                onConfirm={() => {
                  form.setValue("distance", `${tempDistanceInt}.${tempDistanceDec}`)
                  form.setValue("distanceUnit", tempDistanceUnit === "mi" ? "miles" : "kilometers")
                  setIsDistancePickerOpen(false)
                }}
              />
            </>
          )}

          <div className="space-y-2 bg-orange-50 rounded-md p-4">
            <Label className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              How was the activity? (1-10)
            </Label>
            <div className="space-y-4">
              <Slider
                value={[form.watch("intensity")]}
                onValueChange={(value) => form.setValue("intensity", value[0] ?? 5)}
                max={10}
                min={1}
                step={1}
                className="w-full slider-orange"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1 - Very Easy</span>
                <span className="font-medium text-foreground">{form.watch("intensity")}</span>
                <span>10 - Very Hard</span>
              </div>
            </div>
            {form.formState.errors.intensity && (
              <p className="text-sm text-destructive">{form.formState.errors.intensity.message}</p>
            )}
          </div>
          <div className="space-y-2 bg-blue-50 rounded-md p-4">
            <Label className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-blue-500" />
              How likely are you to do this activity again? (1-10)
            </Label>
            <div className="space-y-4">
              <Slider
                value={[form.watch("likelyToDoAgain")]}
                onValueChange={(value) => form.setValue("likelyToDoAgain", value[0] ?? 5)}
                max={10}
                min={1}
                step={1}
                className="w-full slider-blue"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1 - Very Unlikely</span>
                <span className="font-medium text-foreground">{form.watch("likelyToDoAgain")}</span>
                <span>10 - Very Likely</span>
              </div>
            </div>
            {form.formState.errors.likelyToDoAgain && (
              <p className="text-sm text-destructive">{form.formState.errors.likelyToDoAgain.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="How did you feel? What went well? What could be improved?"
              {...form.register("notes")}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter className="flex flex-row w-full gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                form.reset()
              }}
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-1/2">
              Save Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 