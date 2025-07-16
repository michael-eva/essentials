"use client"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Edit, Plus } from "lucide-react"
import type { Workout } from "@/drizzle/src/db/queries"
import { WeekCircularProgress } from "@/components/ui/WeekCircularProgress"
import { useRouter } from "next/navigation"
import PilatesVideoCard from "./PilatesVideoCard"
import type { PilatesVideo } from "@/types/pilates"

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
  onBookClass?: (workoutId: string, name: string) => void;
  editingWeeks?: Set<number>;
  onToggleWeekEdit?: (weekNumber: number) => void;
  accordionValuePrefix?: string;
  isActivePlan: boolean;
  planData?: {
    startDate: Date | null;
    pausedAt: Date | null;
    resumedAt: Date | null;
    totalPausedDuration: number;
  };
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
  accordionValuePrefix = "",
  planData
}: WeeklyScheduleProps) {
  const router = useRouter()
  console.log(weeks);

  // Calculate current week based on plan start date and paused time
  const getCurrentWeek = () => {
    if (!planData?.startDate || !isActivePlan) return null;

    const now = new Date();
    const startDate = new Date(planData.startDate);

    // If plan hasn't started yet, return null
    if (now < startDate) return null;

    // Calculate total paused time in milliseconds
    let totalPausedMs = planData.totalPausedDuration * 1000; // Convert seconds to milliseconds

    // If currently paused, add time since pause
    if (planData.pausedAt && !planData.resumedAt) {
      const pausedAt = new Date(planData.pausedAt);
      totalPausedMs += now.getTime() - pausedAt.getTime();
    }

    // Calculate effective elapsed time (actual time minus paused time)
    // This gives us the "active" time the plan has been running
    const effectiveElapsedMs = now.getTime() - startDate.getTime() - totalPausedMs;

    // If effective elapsed time is negative (shouldn't happen but safety check), return week 1
    if (effectiveElapsedMs < 0) return 1;

    // Convert to weeks (7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    const currentWeek = Math.floor(effectiveElapsedMs / weekInMs) + 1;

    // Ensure current week is within valid range (1 to total weeks)
    return currentWeek > 0 && currentWeek <= weeks.length ? currentWeek : null;
  };

  const currentWeek = getCurrentWeek();

  function handleWorkoutClick(workout: Workout) {
    if (workout.type === 'class') {
      router.push(`/dashboard/class/${workout.id}`)
    } else {
      router.push(`/dashboard/workout/${workout.id}`)
    }
  }
  return (
    <Accordion type="multiple" className="w-full">
      {weeks.map((week) => (
        <AccordionItem key={week.weekNumber} value={`${accordionValuePrefix}week-${week.weekNumber}`}>
          <AccordionTrigger className={`font-bold text-base px-4 py-3 transition-all duration-200 ${currentWeek === week.weekNumber
            ? 'bg-brand-bright-orange/10 border-l-4 border-brand-bright-orange shadow-sm hover:bg-brand-bright-orange/15'
            : 'bg-muted/30 hover:bg-muted/50'
            }`}>
            <div className="grid w-full items-center grid-cols-[auto_1fr_auto] gap-2 md:gap-4">
              <span className="whitespace-nowrap">Week {week.weekNumber}</span>

              <span className="font-normal text-xs md:text-sm min-w-0 truncate">
                {week.classesPerWeek > 0 && week.workoutsPerWeek > 0 && (
                  <>{week.classesPerWeek} Class{week.classesPerWeek === 1 ? '' : 'es'}, {week.workoutsPerWeek} Workout{week.workoutsPerWeek === 1 ? '' : 's'}</>
                )}
                {week.classesPerWeek > 0 && week.workoutsPerWeek === 0 && (
                  <>{week.classesPerWeek} Class{week.classesPerWeek === 1 ? '' : 'es'}</>
                )}
                {week.workoutsPerWeek > 0 && week.classesPerWeek === 0 && (
                  <>{week.workoutsPerWeek} Workout{week.workoutsPerWeek === 1 ? '' : 's'}</>
                )}
                {week.workoutsPerWeek === 0 && week.classesPerWeek === 0 && (
                  <>—</>
                )}
              </span>
              <div className="flex justify-center">
                <WeekCircularProgress
                  value={
                    week.items.filter(Boolean).length > 0
                      ? (week.items.filter(Boolean).filter(item => item?.status === 'completed').length / week.items.filter(Boolean).length) * 100
                      : 0
                  }
                  size={28}
                  className="md:w-8 md:h-8"
                />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className=" pb-4">
            {isEditing && onToggleWeekEdit && (
              <div className="flex justify-end items-end my-4">
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault()
                    onToggleWeekEdit(week.weekNumber)
                  }}
                >
                  <Edit className="w-4 h-4" />
                  {editingWeeks.has(week.weekNumber) ? "Done Editing" : `Edit week ${week.weekNumber}`}
                </Button>
              </div>
            )}
            <div className="space-y-3">
              {week.items.filter(Boolean).map((item, index) => {
                const workout = item as Workout & { mux_playback_id?: string };

                // Convert Workout to PilatesVideo format for class types
                const convertToPilatesVideo = (workout: Workout & { mux_playback_id?: string }): PilatesVideo => ({
                  id: workout.id,
                  title: workout.name,
                  summary: workout.description,
                  duration: workout.duration,
                  difficulty: workout.level,
                  videoUrl: '', // This field is not available in Workout type
                  mux_playback_id: workout.mux_playback_id || null,
                });

                if (workout.type === 'class') {
                  return (
                    <div key={index} className="relative">
                      {isEditing && editingWeeks.has(week.weekNumber) && onDeleteClass && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClass(week.weekNumber, index);
                          }}
                          className="absolute -top-2 right-0 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-sm font-bold transition-colors z-10"
                        >
                          ×
                        </button>
                      )}
                      <PilatesVideoCard video={convertToPilatesVideo(workout)} link={`/dashboard/class/${workout.id}`} />
                      {workout.status === 'completed' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2 mt-2">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Completed
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className={`px-3 pt-3 pb-2 flex flex-col border-l-4 rounded border-b relative min-h-[80px] border-brand-sage bg-brand-sage/10`}
                    onClick={() => handleWorkoutClick(workout)}
                  >
                    {isEditing && editingWeeks.has(week.weekNumber) && onDeleteClass && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClass(week.weekNumber, index);
                        }}
                        className="absolute -top-2 right-0 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-sm font-bold transition-colors z-10"
                      >
                        ×
                      </button>
                    )}
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="font-semibold text-base">{workout.name}</span>
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
                      {workout.status === 'completed' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {isEditing && editingWeeks.has(week.weekNumber) && onAddClass && (
              <div className="mt-4 flex justify-center">
                <Button
                  // variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onAddClass(week.weekNumber)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Workout
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))
      }
    </Accordion >
  );
}