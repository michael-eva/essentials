'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/_components/auth/AuthProvider';

// List of public routes that don't require authentication
const publicRoutes = ['/auth', '/api/trpc'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (!user && !isPublicRoute) {
      // Store the current path to redirect back after login
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/auth/sign-in?redirectedFrom=${redirectUrl}`);
    }
  }, [user, isLoading, pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-sm text-gray-500">Please wait while we check your session.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 