"use client"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Trash2, Edit, Plus } from "lucide-react"
import Link from "next/link"
import type { Workout } from "@/drizzle/src/db/queries"
import { useState } from "react"
import RecordManualActivity, { type ActivityFormValues } from "./RecordManualActivity"
import { activityTypeEnum } from "@/drizzle/src/db/schema"
import { api } from "@/trpc/react"

interface WeeklyScheduleProps {
  weeks: Array<{
    weekNumber: number;
    items: (Workout | null)[];
    classesPerWeek: number;
    workoutsPerWeek: number;
  }>;
  isEditing?: boolean;
  onDeleteClass?: (weekNumber: number, classIndex: number) => void;
  onAddClass?: (weekNumber: number) => void;
  onBookClass?: (workoutId: string) => void;
  editingWeeks?: Set<number>;
  onToggleWeekEdit?: (weekNumber: number) => void;
  accordionValuePrefix?: string;
  isActivePlan: boolean;
}
function StatusButton({ workout, onBookingSubmit, isActivePlan, onWorkoutComplete }: { workout: Workout, onBookingSubmit: (workoutId: string, isBooked: boolean) => void, isActivePlan: boolean, onWorkoutComplete: (workoutId: string) => void }) {
  if (!isActivePlan) return null
  return (
    workout.type === 'class' ? (
      workout.status === 'completed' ? (
        <span className="inline-flex items-center text-xs px-3 py-1 h-7 bg-green-100 text-green-800 rounded">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
          Done
        </span>
      ) : (
        <Button
          size="sm"
          onClick={() => onBookingSubmit(workout.id, workout.isBooked)}
          className="text-xs px-3 py-1 h-7 bg-orange-100 text-orange-800"
        >
          {workout.isBooked ? "Booked" : "Book"}
        </Button>
      )
    ) : workout.type === 'workout' ? (
      workout.status === 'completed' ? (
        <span className="inline-flex items-center text-xs px-3 py-1 h-7 bg-green-100 text-green-800 rounded">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
          Done
        </span>
      ) : (
        <Button
          size="sm"
          onClick={() => onWorkoutComplete(workout.id)}
          className="text-xs px-3 py-1 h-7 bg-orange-100 text-orange-800"
        >
          Completed?
        </Button>
      )
    ) : null
  )
}
export default function WeeklySchedule({
  isActivePlan,
  weeks,
  isEditing = false,
  onDeleteClass,
  onAddClass,
  onBookClass,
  editingWeeks = new Set(),
  onToggleWeekEdit,
  accordionValuePrefix = ""
}: WeeklyScheduleProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedActivityType, setSelectedActivityType] = useState<typeof activityTypeEnum.enumValues[number]>()
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>()
  const utils = api.useUtils();
  const { mutate: insertManualActivity } = api.workoutPlan.insertManualActivity.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivityHistory.invalidate();
    }
  })
  const { mutate: updateWorkoutStatus } = api.workoutPlan.updateWorkoutStatus.useMutation({
    onSuccess: () => {
      void utils.workoutPlan.getActivePlan.invalidate();
    }
  })
  function onBookingSubmit(workoutId: string, isBooked: boolean) {
    if (isBooked) return
    onBookClass?.(workoutId)
  }

  function onWorkoutComplete(activityType?: typeof activityTypeEnum.enumValues[number], workoutId?: string) {
    setSelectedActivityType(activityType)
    setSelectedWorkoutId(workoutId)
    setIsDialogOpen(true)
  }
  function handleSubmitActivity(data: ActivityFormValues) {
    insertManualActivity(data)
    if (selectedWorkoutId) {
      updateWorkoutStatus({ workoutId: selectedWorkoutId, status: "completed" })
    }
    setIsDialogOpen(false)
  }

  return (
    <Accordion type="multiple" className="w-full">
      {weeks.map((week) => (
        <AccordionItem key={week.weekNumber} value={`${accordionValuePrefix}week-${week.weekNumber}`}>
          <AccordionTrigger className="font-bold text-base px-4 py-3 bg-muted/30">
            Week {week.weekNumber} <span className="ml-2 font-normal text-sm text-muted-foreground">{`${week.classesPerWeek > 0 ? `${week.classesPerWeek} Class${week.classesPerWeek === 1 ? '' : 'es'}` : ''}${week.classesPerWeek > 0 && week.workoutsPerWeek > 0 ? ', ' : ''} ${week.workoutsPerWeek > 0 ? `${week.workoutsPerWeek} Workout${week.workoutsPerWeek === 1 ? '' : 's'}` : ''}`}</span>
            {week.items.filter(Boolean).length > 0 && (
              <span className="ml-2 font-normal text-sm text-muted-foreground">
                ({Math.round((week.items.filter(Boolean).filter(item => item?.status === 'completed').length / week.items.filter(Boolean).length) * 100)}% completed)
              </span>
            )}
          </AccordionTrigger>
          <AccordionContent className="px-2 md:px-4 pb-4">
            {isEditing && onToggleWeekEdit && (
              <div className="flex justify-between items-center mb-4">
                <Link
                  href="#"
                  className="text-sm text-muted-foreground flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault()
                    onToggleWeekEdit(week.weekNumber)
                  }}
                >
                  <Edit className="w-4 h-4" />
                  {editingWeeks.has(week.weekNumber) ? "Done Editing" : `Edit week ${week.weekNumber}`}
                </Link>
              </div>
            )}
            <div className="space-y-3">
              {week.items.filter(Boolean).map((item, index) => {
                const workout = item as Workout;
                return (
                  <div
                    key={index}
                    className={`py-3 px-3 flex flex-col gap-2 border-l-4 rounded border-b ${workout.type === 'class'
                      ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/10'
                      : 'border-[color:var(--chart-4)] bg-[color:var(--chart-4)]/10'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {workout.type === 'class' ? (
                            <span className="inline-flex items-center text-xs text-blue-700">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                              Class
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs text-green-700">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg>
                              Workout
                            </span>
                          )}
                          <span className="font-semibold text-base">{workout.name}</span>
                        </div>
                        <div className="flex gap-1 mb-1">
                          <span className="text-xs rounded bg-[var(--secondary)]/10 text-[var(--secondary)] px-2 py-0.5">
                            {workout.level}
                          </span>
                          <span className="text-xs rounded bg-[var(--secondary)]/10 text-[var(--secondary)] px-2 py-0.5">
                            {workout.duration} min
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {workout.description}
                        </div>
                      </div>
                      <StatusButton workout={workout} onBookingSubmit={onBookingSubmit} isActivePlan={isActivePlan} onWorkoutComplete={() => onWorkoutComplete(workout.activityType!)} />
                    </div>
                    {isEditing && editingWeeks.has(week.weekNumber) && workout.type === 'class' && onDeleteClass && (
                      <div className="grid grid-cols-1 gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteClass(week.weekNumber, index)}
                          className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {isEditing && editingWeeks.has(week.weekNumber) && onAddClass && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onAddClass(week.weekNumber)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Class
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))
      }
      <RecordManualActivity
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        handleSubmitActivity={handleSubmitActivity}
        initialActivityType={selectedActivityType}
        workoutId={selectedWorkoutId}
      />
    </Accordion >
  );
}