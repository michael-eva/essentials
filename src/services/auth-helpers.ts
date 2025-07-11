import { supabase } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function verifyOtp(
  email: string,
  token: string,
  supabaseClient: SupabaseClient,
  type: "signup" | "email" = "email",
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
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
