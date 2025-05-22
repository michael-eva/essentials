import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MultiSelectPills } from "../global/multi-select-pills"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card } from "@/components/ui/card"

const workoutFormSchema = z.object({
  ratings: z.array(z.string()).min(1, "Please select at least one rating"),
  wouldDoAgain: z.enum(["yes", "no"], {
    required_error: "Please select whether you would do this workout again",
  }),
  notes: z.string().optional(),
})

export type WorkoutFormValues = z.infer<typeof workoutFormSchema>

export default function RecordWorkout({ isDialogOpen, setIsDialogOpen, handleSubmitWorkoutDetails, workoutId, bookedDate, name }: { isDialogOpen: boolean, setIsDialogOpen: (isOpen: boolean) => void, handleSubmitWorkoutDetails: (workoutId: string, data: WorkoutFormValues, bookedDate: Date, name: string) => void, workoutId: string, bookedDate: Date, name: string }) {
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

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      ratings: [],
      wouldDoAgain: undefined,
      notes: "",
    },
  })

  const onSubmit = (data: WorkoutFormValues) => {
    handleSubmitWorkoutDetails(workoutId, data, bookedDate, name)
    form.reset()
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Workout Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>How was the workout?</Label>
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
            <Label>Would you do this workout again?</Label>
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
              className="border-[var(--border)] text-[var(--primary)]"
              onClick={() => {
                setIsDialogOpen(false)
                form.reset()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[color:var(--primary)]/90">
              Save Details
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
