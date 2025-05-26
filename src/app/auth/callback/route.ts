import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: cookieStore,
        cookieOptions: {
          name: "sb-auth-token",
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        },
        cookieEncoding: "base64url",
      },
    );

    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth error:", error);
      return NextResponse.redirect(new URL("/auth/sign-in", requestUrl.origin));
    }

    if (!session) {
      console.error("No session after code exchange");
      return NextResponse.redirect(new URL("/auth/sign-in", requestUrl.origin));
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
