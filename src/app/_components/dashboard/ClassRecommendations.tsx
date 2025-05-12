"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ClassRecommendation {
  name: string
  duration: number
  level: string
  description: string
  weekNumber: number
  sessionsPerWeek: number
  type: 'class' | 'workout'
}

export default function ClassRecommendations() {
  const [timeCommitment, setTimeCommitment] = useState("2")
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])

  const handleClassSelection = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    )
  }

  const getWeeklySchedules = () => {
    const weeks = parseInt(timeCommitment)
    return Array.from({ length: weeks }, (_, i) => ({
      weekNumber: i + 1,
      items: [...recommendedClasses, ...supplementaryWorkouts].filter(item => item.weekNumber === i + 1),
      sessionsPerWeek: recommendedClasses.find(c => c.weekNumber === i + 1)?.sessionsPerWeek ?? 0
    }))
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Your Personalized Plan</h2>
        <Select value={timeCommitment} onValueChange={setTimeCommitment}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Week Plan</SelectItem>
            <SelectItem value="6">6 Week Plan</SelectItem>
            <SelectItem value="12">12 Week Plan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Weekly Plan</CardTitle>
          <CardDescription>Combined classes and supplementary workouts</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion type="multiple" className="w-full">
            {getWeeklySchedules().map((week) => (
              <AccordionItem key={week.weekNumber} value={`week-${week.weekNumber}`}>
                <AccordionTrigger className="font-bold text-base px-4 py-3 bg-muted/30">
                  Week {week.weekNumber} <span className="ml-2 font-normal text-sm text-muted-foreground">{week.sessionsPerWeek} classes per week</span>
                </AccordionTrigger>
                <AccordionContent className="px-2 md:px-4 pb-4">
                  <div className="space-y-3">
                    {week.items.map((item, index) => (
                      <div
                        key={index}
                        className={`py-3 px-3 flex justify-between items-start border-l-4 rounded border-b ${item.type === 'class'
                          ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/5'
                          : 'border-[color:var(--chart-4)] bg-[color:var(--chart-4)]/5'
                          }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {item.type === 'class' ? (
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
                            <span className="font-semibold text-base">{item.name}</span>
                          </div>
                          <div className="flex gap-1 mb-1">
                            <span className="text-xs rounded bg-secondary/10 text-secondary px-2 py-0.5">
                              {item.level}
                            </span>
                            <span className="text-xs rounded bg-secondary/10 text-secondary px-2 py-0.5">
                              {item.duration} min
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {item.description}
                          </div>
                        </div>
                        {item.type === 'class' && (
                          <Button
                            variant={selectedClasses.includes(item.name) ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => handleClassSelection(item.name)}
                            className="text-xs px-3 py-1 h-7 ml-2"
                          >
                            {selectedClasses.includes(item.name) ? "Selected" : "Select"}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button className="w-full md:w-auto px-8">Save Plan</Button>
      </div>
    </div>
  )
}

const recommendedClasses: ClassRecommendation[] = [
  {
    name: "Pilates Fundamentals",
    duration: 45,
    level: "Beginner",
    description: "Perfect for building core strength and improving posture. This class focuses on the fundamental principles of Pilates.",
    weekNumber: 1,
    sessionsPerWeek: 3,
    type: 'class'
  },
  {
    name: "Advanced Pilates Flow",
    duration: 60,
    level: "Advanced",
    description: "A dynamic flow class that combines traditional Pilates with modern movement patterns.",
    weekNumber: 2,
    sessionsPerWeek: 2,
    type: 'class'
  },
  {
    name: "Pilates & Stretch",
    duration: 50,
    level: "Intermediate",
    description: "A balanced class focusing on flexibility and strength through Pilates movements.",
    weekNumber: 2,
    sessionsPerWeek: 2,
    type: 'class'
  }
]

const supplementaryWorkouts: ClassRecommendation[] = [
  {
    name: "Core Strength Circuit",
    duration: 20,
    level: "Intermediate",
    description: "Quick circuit to strengthen your core and improve stability, perfect for complementing your Pilates practice.",
    weekNumber: 1,
    sessionsPerWeek: 3,
    type: 'workout'
  },
  {
    name: "Mobility Flow",
    duration: 15,
    level: "Beginner",
    description: "Gentle mobility exercises to improve range of motion and prepare your body for Pilates movements.",
    weekNumber: 1,
    sessionsPerWeek: 3,
    type: 'workout'
  },
  {
    name: "Upper Body Burner",
    duration: 25,
    level: "Advanced",
    description: "Strength-focused workout to build upper body power and complement your Pilates routine.",
    weekNumber: 2,
    sessionsPerWeek: 2,
    type: 'workout'
  }
] 