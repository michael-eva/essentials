import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../src/trpc/root.js";
import { createContext } from "../../../src/trpc/context.js";

export default async function handler(request) {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createContext(),
  });

  return response;
}