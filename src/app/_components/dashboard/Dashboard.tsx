"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Flame, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Classes</CardTitle>
          <CardDescription>Your scheduled sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendedClasses.filter(classItem => classItem.isBooked).map((classItem, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{classItem.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {classItem.instructor} • {classItem.duration} min
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-sm text-muted-foreground">{classItem.level}</p>
                  <span className="text-sm text-green-600 font-medium">Booked for {classItem.bookedDate}</span>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <a href="/classes" className="text-sm text-secondary hover:text-secondary/80 font-medium flex items-center">
                View All Classes
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity History</CardTitle>
          <CardDescription>Your recent workouts and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{activity.name}</p>
                  <p className="text-sm text-muted-foreground">{activity.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{activity.duration} min</p>
                  <p className="text-sm text-muted-foreground">{activity.calories} cal</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Health Summary</CardTitle>
          <CardDescription>Your stats for the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm">Average Steps</span>
              </div>
              <span className="font-medium">8,742</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Flame className="h-4 w-4 mr-2 text-orange-500" />
                <span className="text-sm">Avg. Calories Burned</span>
              </div>
              <span className="font-medium">1,842</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />
                <span className="text-sm">Active Days</span>
              </div>
              <span className="font-medium">5/7</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const recentActivities = [
  {
    name: "Morning Run",
    date: "Today, 7:30 AM",
    duration: 32,
    calories: 320,
  },
  {
    name: "Yoga Session",
    date: "Today, 6:00 PM",
    duration: 45,
    calories: 180,
  },
  {
    name: "Weight Training",
    date: "Yesterday, 5:30 PM",
    duration: 60,
    calories: 450,
  },
]

const recommendedClasses = [
  {
    name: "Power Yoga Flow",
    instructor: "Sarah Chen",
    duration: 45,
    level: "Intermediate",
    isBooked: true,
    bookedDate: "Mar 15, 2024"
  },
  {
    name: "HIIT Cardio Blast",
    duration: 30,
    level: "Advanced",
    isBooked: false
  },
  {
    name: "Mindful Stretching",
    instructor: "Emma Davis",
    duration: 40,
    level: "Beginner",
    isBooked: true,
    bookedDate: "Mar 16, 2024"
  }
]
