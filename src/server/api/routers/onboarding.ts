import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { insertOnboarding } from "@/drizzle/src/db/mutations";
import {
  checkOnboardingCompletion,
  getOnboardingData,
} from "@/drizzle/src/db/queries";
import { workoutTimesEnum, weekendTimesEnum } from "@/drizzle/src/db/schema";

export const onboardingRouter = createTRPCRouter({
  postBasicQuestions: protectedProcedure
    .input(
      z.object({
        name: z.string().nullable().optional(),
        age: z.number().nullable().optional(),
        height: z.number().nullable().optional(),
        weight: z.number().nullable().optional(),
        gender: z.string().nullable().optional(),
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
        fitnessLevel: z.string().nullable().optional(),
        exercises: z.array(z.string()).optional(),
        otherExercises: z.array(z.string()).optional().nullable(),
        exerciseFrequency: z.string().nullable().optional(),
        sessionLength: z.string().nullable().optional(),
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
        // exercises,
        // otherExercises,
        // exerciseFrequency,
        // sessionLength,
        step: "fitness_background",
      });
    }),
  postHealthConsiderations: protectedProcedure
    .input(
      z.object({
        injuries: z.boolean().nullable().optional(),
        injuriesDetails: z.string().optional().nullable(),
        recentSurgery: z.boolean().nullable().optional(),
        surgeryDetails: z.string().optional().nullable(),
        chronicConditions: z.array(z.string()).optional().nullable(),
        otherHealthConditions: z.array(z.string()).optional().nullable(),
        pregnancy: z.string().nullable().optional(),
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
        fitnessGoals: z.array(z.string()).optional(),
        goalTimeline: z.string().nullable().optional(),
        specificGoals: z.string().optional(),
        otherFitnessGoals: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { fitnessGoals, goalTimeline, specificGoals, otherFitnessGoals } =
        input;
      const userId = ctx.userId;

      await insertOnboarding({
        userId,
        fitnessGoals,
        // goalTimeline,
        specificGoals,
        otherFitnessGoals,
        step: "fitness_goals",
      });
    }),
  postPilatesExperience: protectedProcedure
    .input(
      z.object({
        fitnessLevel: z.string().nullable().optional(),
        pilatesExperience: z.boolean().nullable().optional(),
        pilatesDuration: z.string().optional().nullable(),
        pilatesStyles: z.array(z.string()).optional(),
        homeEquipment: z.array(z.string()).optional(),
        fitnessGoals: z
          .array(z.string())
          .min(1, "Please select at least one goal"),
        otherFitnessGoals: z.array(z.string()).optional(),
        specificGoals: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        fitnessLevel,
        pilatesExperience,
        pilatesDuration,
        pilatesStyles,
        homeEquipment,
        fitnessGoals,
        otherFitnessGoals,
        specificGoals,
      } = input;
      const userId = ctx.userId;

      await insertOnboarding({
        userId,
        fitnessLevel,
        pilatesExperience,
        pilatesDuration,
        pilatesStyles,
        homeEquipment,
        fitnessGoals,
        otherFitnessGoals,
        specificGoals,
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
      // const isCompleted = await checkOnboardingCompletion(userId);

      await insertOnboarding({
        userId,
        motivation,
        otherMotivation: motivation.includes("Other") ? otherMotivation : null,
        progressTracking,
        otherProgressTracking: progressTracking.includes("Other")
          ? otherProgressTracking
          : null,
        completedAt: new Date(),
        step: "completed",
      });
    }),
  // postWorkoutTiming: protectedProcedure
  //   .input(
  //     z.object({
  //       preferredWorkoutTimes: z.array(z.enum(workoutTimesEnum.enumValues)),
  //       avoidedWorkoutTimes: z.array(z.enum(workoutTimesEnum.enumValues)),
  //       weekendWorkoutTimes: z.enum(weekendTimesEnum.enumValues),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const {
  //       preferredWorkoutTimes,
  //       avoidedWorkoutTimes,
  //       weekendWorkoutTimes,
  //     } = input;
  //     const userId = ctx.userId;
  //     await insertOnboarding({
  //       userId,
  //       preferredWorkoutTimes,
  //       avoidedWorkoutTimes,
  //       weekendWorkoutTimes,
  //       step: "workout_timing",
  //     });
  //   }),
  checkOnboardingCompletion: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const result = await checkOnboardingCompletion(userId);
    return result;
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
        pregnancyConsultedDoctor: null,
        pregnancyConsultedDoctorDetails: null,
        fitnessGoals: [],
        otherFitnessGoals: [],
        goalTimeline: null,
        specificGoals: null,
        pilatesExperience: null,
        pilatesDuration: null,
        pilatesStyles: [],
        homeEquipment: [],
        motivation: [],
        otherMotivation: [],
        progressTracking: [],
        otherProgressTracking: [],
      };
    }
    return onboardingData;
  }),
});
