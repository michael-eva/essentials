// Re-export all DB types from db.ts
export * from "./db.js";

// Common types that might be used across apps
export type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
