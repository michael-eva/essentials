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
import { Slider } from "@/components/ui/slider"
import { Repeat } from "lucide-react"

const workoutFormSchema = z.object({
  intensity: z.number().min(1, "Please select an intensity"),
  likelyToDoAgain: z.number().min(1, "Please select a likelihood to do this workout again"),
  notes: z.string().optional(),
})

export type WorkoutFormValues = z.infer<typeof workoutFormSchema>

export default function MarkClassComplete({ isDialogOpen, setIsDialogOpen, handleSubmitWorkoutDetails, workoutId, bookedDate, name }: { isDialogOpen: boolean, setIsDialogOpen: (isOpen: boolean) => void, handleSubmitWorkoutDetails: (workoutId: string, data: WorkoutFormValues, bookedDate: Date, name: string) => void, workoutId: string, bookedDate: Date, name: string }) {


  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      intensity: 5,
      likelyToDoAgain: undefined,
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
            <Label>How was the workout? (1-10)</Label>
            <div className="space-y-4">
              <Slider
                value={[form.watch("intensity")]}
                onValueChange={(value) => form.setValue("intensity", value[0] ?? 5)}
                max={10}
                min={1}
                step={1}
                className="w-full"
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

          <DialogFooter className="flex flex-row gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsDialogOpen(false)
                form.reset()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              className="flex-1"
            >
              Save Details
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
