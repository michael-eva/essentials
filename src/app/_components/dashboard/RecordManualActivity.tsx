import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MultiSelectPills } from "../global/multi-select-pills"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const activityFormSchema = z.object({
  activityType: z.string({
    required_error: "Please select an activity type",
  }),
  duration: z.string().min(1, "Please enter the duration"),
  distance: z.string().optional(),
  ratings: z.array(z.string()).min(1, "Please select at least one rating"),
  wouldDoAgain: z.enum(["yes", "no"], {
    required_error: "Please select whether you would do this activity again",
  }),
  notes: z.string().optional(),
})

export type ActivityFormValues = z.infer<typeof activityFormSchema>

const ACTIVITY_TYPES = [
  "Running",
  "Cycling",
  "Swimming",
  "Walking",
  "Hiking",
  "Weightlifting",
  "Yoga",
  "Stretching",
  "Other"
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
      activityType: "",
      duration: "",
      distance: "",
      ratings: [],
      wouldDoAgain: undefined,
      notes: "",
    },
  })

  const onSubmit = (data: ActivityFormValues) => {
    handleSubmitActivity(data)
    form.reset()
  }

  const selectedActivity = form.watch("activityType")
  const isCardioActivity = ["Running", "Cycling", "Swimming", "Walking", "Hiking"].includes(selectedActivity)

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
              value={form.watch("activityType")}
              onValueChange={(value) => form.setValue("activityType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.activityType && (
              <p className="text-sm text-destructive">{form.formState.errors.activityType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              placeholder="Enter duration"
              {...form.register("duration")}
            />
            {form.formState.errors.duration && (
              <p className="text-sm text-destructive">{form.formState.errors.duration.message}</p>
            )}
          </div>

          {isCardioActivity && (
            <div className="space-y-2">
              <Label>Distance (miles)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="Enter distance"
                {...form.register("distance")}
              />
              {form.formState.errors.distance && (
                <p className="text-sm text-destructive">{form.formState.errors.distance.message}</p>
              )}
            </div>
          )}

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
            <Label>Would you do this activity again?</Label>
            <RadioGroup
              value={form.watch("wouldDoAgain")}
              onValueChange={(value) => form.setValue("wouldDoAgain", value as "yes" | "no")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="would-do-yes" />
                <Label htmlFor="would-do-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="would-do-no" />
                <Label htmlFor="would-do-no">No</Label>
              </div>
            </RadioGroup>
            {form.formState.errors.wouldDoAgain && (
              <p className="text-sm text-destructive">{form.formState.errors.wouldDoAgain.message}</p>
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