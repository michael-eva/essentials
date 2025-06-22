// Common types that might be used across apps
export type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// Note: Database types should be imported directly from @essentials/database
// in consuming apps to avoid circular dependencies during build
//
// Example usage in your apps:
// import type { User, NewUser } from "@essentials/database";
