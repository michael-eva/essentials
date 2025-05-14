import { sampleWorkoutPlans, type Workout } from "@/data/workouts";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
export const workoutPlanRouter = createTRPCRouter({
  getPreviousPlans: publicProcedure.query(() => {
    return sampleWorkoutPlans.filter((plan) => plan.isActive === false);
  }),
  getActivePlan: publicProcedure.query(() => {
    return sampleWorkoutPlans.find((plan) => plan.isActive === true);
  }),
  getSupplementaryWorkouts: publicProcedure.query(() => {
    return sampleWorkoutPlans
      .flatMap((plan) => plan.weeklySchedules)
      .flatMap((schedule) =>
        schedule.items.filter((item) => item.type === "workout"),
      );
  }),
  getUpcomingClasses: publicProcedure.query(() => {
    // Get booked classes from samplePreviousPlans
    const bookedClassesFromPlans = sampleWorkoutPlans
      .flatMap((plan) => plan.weeklySchedules)
      .flatMap((schedule) => schedule.items)
      .filter((item) => item.isBooked === true)
      .map((item) => ({
        id: item.name.toLowerCase().replace(/\s+/g, "-"),
        name: item.name,
        instructor: item.instructor ?? "TBD",
        duration: item.duration,
        level: item.level,
        type: item.type,
        bookedDate:
          item.bookedDate ??
          new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        status: item.status ?? "not_recorded",
        isBooked: true,
      }));

    // Combine with classes from upcomingClasses array
    return [...bookedClassesFromPlans];
  }),
  getWorkoutsToLog: publicProcedure.query(() => {
    const filterCondition = (c: Workout) =>
      c.status === "not_recorded" &&
      c.isBooked === true &&
      c.bookedDate &&
      new Date(c.bookedDate) < new Date();

    const recommendedToLog = sampleWorkoutPlans
      .flatMap((plan) => plan.weeklySchedules)
      .flatMap((schedule) => schedule.items)
      .filter((c) => c.isBooked === true)
      .map((c) => ({
        id: c.name.toLowerCase().replace(/\s+/g, "-"),
        name: c.name,
        instructor: c.instructor ?? "TBD",
        duration: c.duration,
        level: c.level,
        type: c.type,
        description: c.description,
        bookedDate:
          c.bookedDate ??
          new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        status: c.status,
        isBooked: true,
      }))
      .filter(filterCondition);

    return [...recommendedToLog];
  }),
  getActivityHistory: publicProcedure.query(() => {
    return sampleWorkoutPlans
      .flatMap((plan) => plan.weeklySchedules)
      .flatMap((schedule) => schedule.items)
      .filter((item) => item.status === "completed")
      .map((item) => ({
        workout: item.workoutTracking,
      }));
  }),
});
