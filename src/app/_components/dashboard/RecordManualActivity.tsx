import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MultiSelectPills } from "../global/multi-select-pills"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import { Clock, Ruler, Activity } from "lucide-react"
import { WheelPicker } from "./WheelPicker"
import { CustomInput } from "@/app/_components/dashboard/InputLayout"
import { DatePicker } from "@/components/ui/date-picker"

const activityFormSchema = z.object({
  workoutType: z.string({
    required_error: "Please select an activity type",
  }),
  date: z.date(),
  durationHours: z.number().min(0, "Hours must be 0 or greater"),
  durationMinutes: z.number().min(0, "Minutes must be 0 or greater").max(59, "Minutes must be less than 60"),
  distance: z.string().optional(),
  distanceUnit: z.enum(["miles", "kilometers"], {
    required_error: "Please select a distance unit",
  }),
  ratings: z.array(z.string()).min(1, "Please select at least one rating"),
  notes: z.string().optional(),
})

export type ActivityFormValues = z.infer<typeof activityFormSchema>

const ACTIVITY_TYPES = [
  "Running",
  "Cycling",
  "Swimming",
  "Walking",
  "Hiking",
  "Rowing",
  "Elliptical",
]

const workoutRatingOptions = [
  "Great",
  "Good",
  "Struggled a bit",
  "Challenging",
  "Easy",
  "Intense",
  "Fun",
  "Boring"
]

function safeParseInt(val: string | undefined) {
  return /^\d+$/.test(val ?? "") ? parseInt(val!, 10) : 0;
}

export default function RecordManualActivity({
  isDialogOpen,
  setIsDialogOpen,
  handleSubmitActivity
}: {
  isDialogOpen: boolean
  setIsDialogOpen: (isOpen: boolean) => void
  handleSubmitActivity: (data: ActivityFormValues) => void
}) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      workoutType: "",
      date: new Date(),
      durationHours: 0,
      durationMinutes: 0,
      distance: "",
      distanceUnit: "kilometers",
      ratings: [],
      notes: "",
    },
  })

  const onSubmit = (data: ActivityFormValues) => {
    handleSubmitActivity(data)
    form.reset()
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
              onValueChange={(value) => form.setValue("workoutType", value)}
            >
              <SelectTrigger className="flex items-center w-full border rounded-md px-3 py-2 text-left bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-left">
                  <SelectValue placeholder="Select activity type" />
                </span>
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.workoutType && (
              <p className="text-sm text-destructive">{form.formState.errors.workoutType.message}</p>
            )}
          </div>
          {/* <div className="space-y-2">
            <Label>Location</Label>
            <RadioGroup
              value={form.watch("location")}
              onValueChange={(value) => form.setValue("location", value as "indoor" | "outdoor")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="indoor" id="location-indoor" />
                <Label htmlFor="location-indoor">Indoor (Machine)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="outdoor" id="location-outdoor" />
                <Label htmlFor="location-outdoor">Outdoor</Label>
              </div>
            </RadioGroup>
            {form.formState.errors.location && (
              <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
            )}
          </div> */}
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

          <div className="space-y-2">
            <Label>How was the activity?</Label>
            <MultiSelectPills
              options={workoutRatingOptions}
              selectedValues={form.watch("ratings")}
              onChange={(rating) => {
                const currentRatings = form.getValues("ratings")
                const newRatings = currentRatings.includes(rating)
                  ? currentRatings.filter(r => r !== rating)
                  : [...currentRatings, rating]
                form.setValue("ratings", newRatings)
              }}
              className="mt-2"
            />
            {form.formState.errors.ratings && (
              <p className="text-sm text-destructive">{form.formState.errors.ratings.message}</p>
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                form.reset()
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 