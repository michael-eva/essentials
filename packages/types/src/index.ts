// Re-export all DB types from db.ts
export * from "./db";

// API Router Type - import from the API app
export type { AppRouter } from "../../../apps/api/src/trpc/root";

// Common types that might be used across apps
export type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
