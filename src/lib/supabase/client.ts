import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/env";

// Create a single instance of the Supabase client
export const supabase = createBrowserClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storageKey: "sb-rflvcogfitcffdappsuz-auth-token",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);
