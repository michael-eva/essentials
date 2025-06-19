// Re-export all DB types from db.ts for easy access
export * from "./db";

// Re-export tRPC router types
export type { AppRouter } from "../../../apps/api/src/trpc/root";

// Re-export common types that might be used across apps
export type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
