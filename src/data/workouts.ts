export interface WorkoutPlan {
  planName: string;
  timeCommitment: string;
  selectedClasses: string[];
  completedWorkouts: Record<string, boolean>;
  savedAt: string;
  archived: boolean;
  archivedAt?: string;
  isActive: boolean;
  weeklySchedules: {
    items: Workout[];
    weekNumber?: number;
  }[];
}

export type WorkoutStatus = "completed" | "not_completed" | "not_recorded";

export interface Workout {
  id: string;
  name: string;
  instructor: string;
  duration: number;
  description: string;
  level: string;
  bookedDate: string;
  type: "class" | "workout";
  status?: WorkoutStatus;
  isBooked: boolean;
  sessionsPerWeek?: number;
  weekNumber?: number;
  workoutTracking?: {
    journalEntry: string;
    timeLogged: number;
    dateLogged: string;
    name: string;
  };
}

export const sampleWorkoutPlans: WorkoutPlan[] = [
  {
    planName: "Summer Strength Focus",
    timeCommitment: "2",
    selectedClasses: ["Pilates Fundamentals", "Advanced Pilates Flow"],
    completedWorkouts: {
      "Core Strength Circuit": true,
      "Mobility Flow": true,
      "Upper Body Burner": false,
    },
    savedAt: "2024-03-15T10:30:00Z",
    archived: false,
    isActive: true,
    weeklySchedules: [
      {
        items: [
          {
            id: "pilates-fundamentals-1",
            name: "Pilates Fundamentals",
            instructor: "Sarah Johnson",
            duration: 45,
            level: "Beginner",
            description:
              "Perfect for building core strength and improving posture. This class focuses on the fundamental principles of Pilates.",
            weekNumber: 1,
            type: "class",
            isBooked: true,
            bookedDate: "2024-03-15T10:30:00Z",
            status: "not_recorded",
          },
          {
            id: "core-strength-1",
            name: "Core Strength Circuit",
            instructor: "Mike Smith",
            duration: 20,
            level: "Intermediate",
            description:
              "Quick circuit to strengthen your core and improve stability, perfect for complementing your Pilates practice.",
            weekNumber: 1,
            type: "class",
            status: "completed",
            isBooked: false,
            bookedDate: "",
          },
        ],
        weekNumber: 1,
      },
      {
        items: [
          {
            id: "advanced-pilates-1",
            name: "Advanced Pilates Flow",
            instructor: "Emma Davis",
            duration: 60,
            level: "Advanced",
            description:
              "A dynamic flow class that combines traditional Pilates with modern movement patterns.",
            weekNumber: 2,
            type: "class",
            status: "completed",
            isBooked: false,
            bookedDate: "",
          },
          {
            id: "upper-body-1",
            name: "Upper Body Burner",
            instructor: "John Wilson",
            duration: 25,
            level: "Advanced",
            description:
              "Strength-focused workout to build upper body power and complement your Pilates routine.",
            weekNumber: 2,
            type: "workout",
            status: "completed",
            isBooked: true,
            bookedDate: "2024-03-15T10:30:00Z",
          },
        ],
        weekNumber: 2,
      },
    ],
  },
  {
    planName: "Build & Tone",
    timeCommitment: "1",
    selectedClasses: ["Pilates & Stretch"],
    completedWorkouts: {
      "Mobility Flow": true,
    },
    savedAt: "2024-03-10T14:15:00Z",
    archived: false,
    isActive: false,
    weeklySchedules: [
      {
        items: [
          {
            id: "pilates-stretch-1",
            name: "Pilates & Stretch",
            instructor: "Lisa Brown",
            duration: 50,
            level: "Intermediate",
            description:
              "A balanced class focusing on flexibility and strength through Pilates movements.",
            weekNumber: 1,
            type: "class",
            status: "completed",
            isBooked: false,
            bookedDate: "",
            workoutTracking: {
              journalEntry:
                "I felt great after this class. It was a good mix of strength and flexibility work.",
              timeLogged: 45,
              dateLogged: "2024-03-10T14:15:00Z",
              name: "Pilates & Stretch",
            },
          },
          {
            id: "mobility-flow-1",
            name: "Mobility Flow",
            instructor: "Tom Harris",
            duration: 15,
            level: "Beginner",
            description:
              "Gentle mobility exercises to improve range of motion and prepare your body for Pilates movements.",
            weekNumber: 1,
            type: "workout",
            status: "completed",
            isBooked: true,
            bookedDate: "2024-03-10T14:15:00Z",
            workoutTracking: {
              journalEntry:
                "I felt great after this class. It was a good mix of strength and flexibility work.",
              timeLogged: 45,
              dateLogged: "2024-03-10T10:15:00Z",
              name: "Mobility Flow",
            },
          },
        ],
        weekNumber: 1,
      },
    ],
  },
  {
    planName: "Flexibility & Recovery",
    timeCommitment: "1",
    selectedClasses: ["Pilates & Stretch"],
    completedWorkouts: {
      "Mobility Flow": true,
    },
    savedAt: "2024-03-10T14:15:00Z",
    archived: false,
    isActive: false,
    weeklySchedules: [
      {
        items: [
          {
            id: "pilates-stretch-1",
            name: "Pilates & Stretch",
            instructor: "Lisa Brown",
            duration: 50,
            level: "Intermediate",
            description:
              "A balanced class focusing on flexibility and strength through Pilates movements.",
            weekNumber: 1,
            type: "class",
            status: "completed",
            isBooked: false,
            bookedDate: "",
            workoutTracking: {
              journalEntry:
                "I felt great after this class. It was a good mix of strength and flexibility work.",
              timeLogged: 45,
              dateLogged: "2024-03-10T14:15:00Z",
              name: "Pilates & Stretch",
            },
          },
          {
            id: "mobility-flow-1",
            name: "Mobility Flow",
            instructor: "Tom Harris",
            duration: 15,
            level: "Beginner",
            description:
              "Gentle mobility exercises to improve range of motion and prepare your body for Pilates movements.",
            weekNumber: 1,
            type: "workout",
            status: "completed",
            isBooked: true,
            bookedDate: "2024-03-10T14:15:00Z",
            workoutTracking: {
              journalEntry:
                "I felt great after this class. It was a good mix of strength and flexibility work.",
              timeLogged: 45,
              dateLogged: "2024-03-10T10:15:00Z",
              name: "Mobility Flow",
            },
          },
        ],
        weekNumber: 1,
      },
    ],
  },
];
