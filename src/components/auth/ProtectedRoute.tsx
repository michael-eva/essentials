'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

// List of public routes that don't require authentication
const publicRoutes = ['/', '/auth', '/api/trpc', '/terms-of-service', '/privacy-policy'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // Check if the current path is a public route
      const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

      if (!session && !isPublicRoute) {
        // Store the current path to redirect back after login
        const redirectUrl = encodeURIComponent(pathname);
        router.push(`/auth?redirectedFrom=${redirectUrl}`);
      }
    };

    void checkAuth().catch(error => {
      console.error('Auth check failed:', error);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  return <>{children}</>;
} 