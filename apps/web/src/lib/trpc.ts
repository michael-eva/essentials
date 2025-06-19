import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { type AppRouter } from "../../../api/src/trpc/root";

export const trpc = createTRPCReact<AppRouter>();

// Client configuration
export const trpcClient = {
  links: [
    httpBatchLink({
      url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/trpc",
      // You can pass any HTTP headers you wish here
      async headers() {
        return {
          // authorization: getAuthCookie(),
        };
      },
    }),
  ],
  transformer: undefined, // Use the same transformer as the server
};
