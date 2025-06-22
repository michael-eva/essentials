import "server-only";

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { headers } from "next/headers";
import SuperJSON from "superjson";

import { type AppRouter } from "@essentials/types";

const getApiUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXT_PUBLIC_API_URL || "https://your-api-domain.com/trpc";
  }
  return "http://localhost:3001/trpc";
};

/**
 * Server-side tRPC client for use in Server Components and Server Actions
 */
export const api = createTRPCProxyClient<AppRouter>({
  transformer: SuperJSON,
  links: [
    httpBatchLink({
      url: getApiUrl(),
      headers: async () => {
        const heads = await headers();
        const authHeader = heads.get("authorization");
        
        return {
          "x-trpc-source": "rsc",
          ...(authHeader && { authorization: authHeader }),
        };
      },
    }),
  ],
});
