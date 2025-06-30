import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

export type ExerciseSet = {
  id: string
  reps: number
  weight: number
}

export type Exercise = {
  id: string
  name: string
  sets: ExerciseSet[]
}

interface ExerciseListProps {
  exercises: Exercise[]
  onChange: (exercises: Exercise[]) => void
}

export function ExerciseList({ exercises, onChange }: ExerciseListProps) {
  const addExercise = () => {
    onChange([
      ...exercises,
      {
        id: crypto.randomUUID(),
        name: "",
        sets: [],
      },
    ])
  }

  const removeExercise = (id: string) => {
    onChange(exercises.filter((exercise) => exercise.id !== id))
  }

  const updateExerciseName = (id: string, name: string) => {
    onChange(
      exercises.map((exercise) =>
        exercise.id === id ? { ...exercise, name } : exercise
      )
    )
  }

  const addSet = (exerciseId: string) => {
    onChange(
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
            ...exercise,
            sets: [
              ...exercise.sets,
              {
                id: crypto.randomUUID(),
                reps: 0,
                weight: 0,
              },
            ],
          }
          : exercise
      )
    )
  }

  const removeSet = (exerciseId: string, setId: string) => {
    onChange(
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
            ...exercise,
            sets: exercise.sets.filter((set) => set.id !== setId),
          }
          : exercise
      )
    )
  }

  const updateSet = (exerciseId: string, setId: string, field: keyof ExerciseSet, value: number) => {
    onChange(
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
            ...exercise,
            sets: exercise.sets.map((set) =>
              set.id === setId ? { ...set, [field]: value } : set
            ),
          }
          : exercise
      )
    )
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <div key={exercise.id} className="space-y-4 p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <Label>Exercise</Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeExercise(exercise.id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Input
            placeholder="Exercise name"
            value={exercise.name}
            onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
          />
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Sets</Label>
              <Button
                type="button"
                size="sm"
                onClick={() => addSet(exercise.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Set
              </Button>
            </div>
            {exercise.sets.map((set, index) => (
              <div key={set.id} className="grid grid-cols-3 gap-4 items-center">
                <div className="text-sm text-muted-foreground">Set {index + 1}</div>
                <div className="space-y-1">
                  <Label className="text-xs">Reps</Label>
                  <Input
                    type="number"
                    min="0"
                    value={set.reps}
                    onChange={(e) => updateSet(exercise.id, set.id, "reps", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Weight (kg)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={set.weight}
                      onChange={(e) => updateSet(exercise.id, set.id, "weight", parseFloat(e.target.value) || 0)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSet(exercise.id, set.id)}
                      className="h-10 w-10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button
        type="button"
        onClick={addExercise}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Exercise
      </Button>
    </div>
  )
} 