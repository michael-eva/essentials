import { env } from "@/env";

export const isDeveloper = () => {
  return env.NEXT_PUBLIC_USER_ROLE === "DEVELOPER";
};
