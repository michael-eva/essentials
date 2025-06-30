import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { insertOnboarding } from "@/drizzle/src/db/mutations";
import {
  checkOnboardingCompletion,
  getOnboardingData,
} from "@/drizzle/src/db/queries";

export const onboardingRouter = createTRPCRouter({
  postBasicQuestions: protectedProcedure
    .input(
      z.object({
        name: z.string().nullable(),
        age: z.number().nullable(),
        height: z.number().nullable(),
        weight: z.number().nullable(),
        gender: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, age, height, weight, gender } = input;
      const userId = ctx.userId;

      await insertOnboarding({
        userId,
        name,
        age,
        height,
        weight,
        gender,
        step: "basic_questions",
      });
    }),
  postFitnessBackground: protectedProcedure
    .input(
      z.object({
        fitnessLevel: z.string().nullable(),
        exercises: z.array(z.string()),
        otherExercises: z.array(z.string()).optional().nullable(),
        exerciseFrequency: z.string().nullable(),
        sessionLength: z.string().nullable(),
        preferred_workout_times:z.array(z.string()).optional().nullable(),
        avoided_workout_times:z.array(z.string()).optional().nullable(),
        weekend_workout_times:z.array(z.string()).optional().nullable()
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        fitnessLevel,
        exercises,
        otherExercises,
        exerciseFrequency,
        sessionLength,
        preferred_workout_times,
        avoided_workout_times,
        weekend_workout_times

      } = input;
      const userId = ctx.userId;

      await insertOnboarding({
        userId,
        fitnessLevel,
        exercises,
        otherExercises,
        exerciseFrequency,
        sessionLength,
        step: "fitness_background",
        preferred_workout_times,
        avoided_workout_times,
        weekend_workout_times
      });
    }),
  postHealthConsiderations: protectedProcedure
    .input(
      z.object({
        injuries: z.boolean().nullable(),
        injuriesDetails: z.string().optional().nullable(),
        recentSurgery: z.boolean().nullable(),
        surgeryDetails: z.string().optional().nullable(),
        chronicConditions: z.array(z.string()),
        otherHealthConditions: z.array(z.string()).optional().nullable(),
        pregnancy: z.string(),
        pregnancyConsultedDoctor: z.boolean().optional().nullable(),
        pregnancyConsultedDoctorDetails: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        injuries,
        injuriesDetails,
        recentSurgery,
        surgeryDetails,
        chronicConditions,
        otherHealthConditions,
        pregnancy,
        pregnancyConsultedDoctor,
        pregnancyConsultedDoctorDetails,
      } = input;
      const userId = ctx.userId;

      await insertOnboarding({
        userId,
        injuries,
        injuriesDetails,
        recentSurgery,
        surgeryDetails,
        chronicConditions,
        otherHealthConditions,
        pregnancy,
        pregnancyConsultedDoctor,
        pregnancyConsultedDoctorDetails,
        step: "health_considerations",
      });
    }),
  postFitnessGoals: protectedProcedure
    .input(
      z.object({
        fitnessGoals: z.array(z.string()),
        goalTimeline: z.string().nullable(),
        specificGoals: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { fitnessGoals, goalTimeline, specificGoals } = input;
      const userId = ctx.userId;

      await insertOnboarding({
        userId,
        fitnessGoals,
        goalTimeline,
        specificGoals,
        step: "fitness_goals",
      });
    }),
  postPilatesExperience: protectedProcedure
    .input(
      z.object({
        pilatesExperience: z.boolean().nullable(),
        pilatesDuration: z.string().optional().nullable(),
        studioFrequency: z.string().nullable(),
        sessionPreference: z.string().nullable(),
        apparatusPreference: z.array(z.string()),
        customApparatus: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        pilatesExperience,
        pilatesDuration,
        studioFrequency,
        sessionPreference,
        apparatusPreference,
        customApparatus,
      } = input;
      const userId = ctx.userId;

      await insertOnboarding({
        userId,
        pilatesExperience,
        pilatesDuration,
        studioFrequency,
        sessionPreference,
        apparatusPreference,
        customApparatus,
        step: "pilates_experience",
      });
    }),
  postMotivation: protectedProcedure
    .input(
      z.object({
        motivation: z.array(z.string()),
        otherMotivation: z.array(z.string()).optional(),
        progressTracking: z.array(z.string()),
        otherProgressTracking: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        motivation,
        otherMotivation,
        progressTracking,
        otherProgressTracking,
      } = input;
      const userId = ctx.userId;
      // required fields are: name, age, weight, gender, fitnessLevel, exercises, exerciseFrequency, sessionLength, injuries, recentSurgery, chronicConditions, pregnancy, fitnessGoals, goalTimeline, pilatesExperience, studioFrequency, sessionPreference, instructors, apparatusPreference, motivation, progressTracking
      const isCompleted = await checkOnboardingCompletion(userId);

      await insertOnboarding({
        userId,
        motivation,
        otherMotivation: motivation.includes("Other") ? otherMotivation : null,
        progressTracking,
        otherProgressTracking: progressTracking.includes("Other")
          ? otherProgressTracking
          : null,
        completedAt: isCompleted ? new Date() : null,
        step: isCompleted ? "completed" : "motivation",
      });
    }),

  checkOnboardingCompletion: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const isCompleted = await checkOnboardingCompletion(userId);
    return isCompleted;
  }),
  getOnboardingData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const onboardingData = await getOnboardingData(userId);
    if (!onboardingData) {
      return {
        name: null,
        age: null,
        height: null,
        weight: null,
        gender: null,
        fitnessLevel: null,
        exercises: [],
        otherExercises: [],
        exerciseFrequency: null,
        sessionLength: null,
        injuries: null,
        injuriesDetails: null,
        recentSurgery: null,
        surgeryDetails: null,
        chronicConditions: [],
        otherHealthConditions: [],
        pregnancy: null,
        fitnessGoals: [],
        goalTimeline: null,
        specificGoals: null,
        pilatesExperience: null,
        pilatesDuration: null,
        studioFrequency: null,
        sessionPreference: null,
        // instructors: [],
        // customInstructor: null,
        apparatusPreference: [],
        customApparatus: [],
        motivation: [],
        otherMotivation: [],
        progressTracking: [],
        otherProgressTracking: [],
      };
    }
    return onboardingData;
  }),
});
