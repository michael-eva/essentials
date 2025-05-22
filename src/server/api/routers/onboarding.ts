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
        name: z.string(),
        age: z.number(),
        height: z.number(),
        weight: z.number(),
        gender: z.string(),
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
        fitnessLevel: z.string(),
        exercises: z.array(z.string()),
        otherExercises: z.array(z.string()).optional(),
        exerciseFrequency: z.string(),
        sessionLength: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        fitnessLevel,
        exercises,
        otherExercises,
        exerciseFrequency,
        sessionLength,
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
      });
    }),
  postHealthConsiderations: protectedProcedure
    .input(
      z.object({
        injuries: z.boolean(),
        injuriesDetails: z.string().optional(),
        recentSurgery: z.boolean(),
        surgeryDetails: z.string().optional(),
        chronicConditions: z.array(z.string()),
        otherHealthConditions: z.array(z.string()).optional(),
        pregnancy: z.string(),
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
        step: "health_considerations",
      });
    }),
  postFitnessGoals: protectedProcedure
    .input(
      z.object({
        fitnessGoals: z.array(z.string()),
        goalTimeline: z.string(),
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
        pilatesExperience: z.boolean(),
        pilatesDuration: z.string().optional(),
        studioFrequency: z.string(),
        sessionPreference: z.string(),
        instructors: z.array(z.string()),
        customInstructor: z.string().optional(),
        apparatusPreference: z.array(z.string()),
        customApparatus: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        pilatesExperience,
        pilatesDuration,
        studioFrequency,
        sessionPreference,
        instructors,
        customInstructor,
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
        instructors,
        customInstructor,
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
        otherMotivation,
        progressTracking,
        otherProgressTracking,
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
    return onboardingData;
  }),
});
