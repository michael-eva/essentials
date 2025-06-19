import { type SupabaseClient } from "@supabase/supabase-js";
export declare function verifyOtp(email: string, token: string, supabaseClient: SupabaseClient, type?: "signup" | "email"): Promise<{
    user: import("@supabase/supabase-js").AuthUser | null;
    session: import("@supabase/supabase-js").AuthSession | null;
}>;
export declare function login(email: string, password: string): Promise<{
    user: import("@supabase/supabase-js").AuthUser;
    session: import("@supabase/supabase-js").AuthSession;
    weakPassword?: import("@supabase/supabase-js").WeakPassword;
}>;
export declare function logout(): Promise<void>;
export declare function updatePassword(password: string): Promise<{
    user: import("@supabase/supabase-js").AuthUser;
}>;
//# sourceMappingURL=auth-helpers.d.ts.map