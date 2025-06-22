import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Create Supabase client lazily to ensure env vars are loaded
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
export async function verifyOtp(
  email: string,
  token: string,
  supabaseClient: SupabaseClient,
  type: "signup" | "email" = "email"
) {
  const { data, error } = await supabaseClient.auth.verifyOtp({
    email,
    token,
    type,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function login(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function logout() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function updatePassword(password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
