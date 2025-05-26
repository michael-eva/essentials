import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

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
  const publicRoutes = ["/auth/*"];

  // Check if the current path starts with any of the public routes
  return !publicRoutes.some((route) => {
    const pattern = route.replace(/\*/g, ".*");
    return new RegExp(`^${pattern}`).test(pathname);
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
