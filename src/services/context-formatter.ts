import type { UserContext } from "./context-manager";

/**
 * Formats user context into a readable text format for AI consumption
 * This is a shared utility used across different AI services
 */
export function formatUserContextForAI(context: UserContext): string {
  const { pilates, motivationInfo, health } = context.profile;
  const { recentActivity, progress, workoutPlan } = context;

  return `
PROFILE:
- Fitness Level: ${pilates.fitnessLevel ?? "Not specified"}
- Pilates Experience: ${pilates.pilatesExperience ? "Yes" : "No"}
- Pilates Duration: ${pilates.pilatesDuration ?? "Not specified"}
- Pilates Equipment the user has at home: ${pilates.homeEquipment?.join(", ") ?? "Not specified"}

MOTIVATION & GOALS:
- Motivation Factors: ${motivationInfo.motivation?.join(", ") ?? "Not specified"}
- Other Motivations: ${motivationInfo.otherMotivation?.join(", ") ?? "Not specified"}
- Progress Tracking Methods: ${motivationInfo.progressTracking?.join(", ") ?? "Not specified"}
- Other Progress Tracking: ${motivationInfo.otherProgressTracking?.join(", ") ?? "Not specified"}

HEALTH INFORMATION:
- Injuries: ${health.injuries ? `Yes - ${health.injuriesDetails}` : "No injuries reported"}
- Recent Surgery: ${health.recentSurgery ? `Yes - ${health.surgeryDetails}` : "No recent surgery"}
- Chronic Conditions: ${health.chronicConditions?.join(", ") ?? "None"}
- Other Health Conditions: ${health.otherHealthConditions?.join(", ") ?? "None"}
- Pregnancy: ${health.pregnancy ?? "Not specified"}
- Pregnancy Consulted Doctor: ${health.pregnancyConsultedDoctor ? "Yes" : "No"}
- Pregnancy Consulted Doctor Details: ${health.pregnancyConsultedDoctorDetails ?? "Not specified"}

RECENT ACTIVITY:
- Total Workouts (Last 30 days): ${recentActivity.recentWorkouts.length}
- Weekly Average: ${recentActivity.consistency.weeklyAverage} workouts
- Monthly Average: ${recentActivity.consistency.monthlyAverage} workouts
- Current Streak: ${recentActivity.consistency.streak} days

RECENTLY COMPLETED WORKOUTS:
${
  recentActivity.recentWorkouts.length > 0
    ? recentActivity.recentWorkouts
        .slice(-5) // Last 5 workouts
        .map(
          (workout) =>
            `- ${workout.workout?.name ?? "Unnamed"} (${workout.workout?.activityType ?? "Unknown"}) - ${workout.workoutTracking.durationHours}h ${workout.workoutTracking.durationMinutes}m - Intensity: ${workout.workoutTracking.intensity}/10 - Would do again: ${workout.workoutTracking.likelyToDoAgain}/10`,
        )
        .join("\n")
    : "- No recent workouts recorded"
}

CURRENT WORKOUT PLAN:
${
  workoutPlan.plannedWorkouts.length > 0
    ? workoutPlan.plannedWorkouts
        .map(
          (workout, index) =>
            `- Workout ${index + 1}: ${workout.name}
             - Description: ${workout.description ?? "No description"}
             - Activity Type: ${workout.activityType ?? "Not specified"}
             - Duration: ${workout.duration ?? "Not specified"}
             - Level: ${workout.level ?? "Not specified"}
             - Has it been booked: ${workout.isBooked ? "Yes" : "No"}
             - Other Notes: ${workout.status ?? "None"}`,
        )
        .join("\n")
    : "- No planned workouts"
}

PROGRESS & CHALLENGES:
- Current Challenges: ${progress.challenges?.join(", ") ?? "Not specified"}
- Recent Improvements: ${progress.improvements?.join(", ") ?? "Not specified"}
- Goal Progress: ${
    Object.entries(progress.goalProgress)
      .map(([goal, progress]) => `${goal}: ${progress}%`)
      .join(", ") || "No goals tracked"
  }
`;
}
