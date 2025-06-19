import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../src/trpc/root.js";
import { createContext } from "../../src/trpc/context.js";


export default async function handler(request) {
  // Handle CORS
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createContext(),
    responseMeta() {
      return {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-trpc-source",
        },
      };
    },
  });

  return response;
}