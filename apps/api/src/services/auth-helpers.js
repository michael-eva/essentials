import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
export async function verifyOtp(email, token, supabaseClient, type = "email") {
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
export async function login(email, password) {
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
export async function updatePassword(password) {
    const { data, error } = await supabase.auth.updateUser({
        password,
    });
    if (error) {
        throw new Error(error.message);
    }
    return data;
}
//# sourceMappingURL=auth-helpers.js.map