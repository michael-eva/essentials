import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookies = req.cookies.getAll();
          return cookies.map((cookie) => ({
            ...cookie,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          }));
        },
        setAll: (cookies) => {
          cookies.forEach((cookie) => {
            res.cookies.set({
              ...cookie,
              path: "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            });
          });
        },
      },
      cookieOptions: {
        name: "sb-auth-token",
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
  );

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If there's no session and the user is trying to access a protected route
  if (!session && isProtectedRoute(req.nextUrl.pathname)) {
    const redirectUrl = new URL("/auth/sign-in", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Define which routes should be protected
function isProtectedRoute(pathname: string): boolean {
  // List of public routes that don't require authentication
  const publicRoutes = [
    "/auth/*", // All auth routes including callback // Allow tRPC auth-related routes
  ];

  // Check if the current path starts with any of the public routes
  return !publicRoutes.some((route) => {
    const pattern = route.replace(/\*/g, ".*");
    return new RegExp(`^${pattern}`).test(pathname);
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
