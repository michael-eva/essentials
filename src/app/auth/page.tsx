'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ACCESS_CODE_STORAGE_KEY = "essentials_access_code_validated";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has valid access code
    const storedValidation = localStorage.getItem(ACCESS_CODE_STORAGE_KEY);
    if (storedValidation !== "true") {
      // Redirect to root if no valid access code
      router.push('/');
      return;
    }
    // Prevent scrolling on this page
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalHeight = document.body.style.height;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.height = '100%';
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.height = originalHeight;
      document.body.style.width = '';
    };
  }, []);

  const handleGetStarted = () => {
    router.push('/auth/sign-in?mode=new');
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in?mode=existing');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <video
        src="https://rflvcogfitcffdappsuz.supabase.co/storage/v1/object/public/marketing-videos//new_essentials.webm"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      {/* Fixed positioned buttons */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
      // style={{
      //   paddingBottom: 'max(20px, env(safe-area-inset-bottom))'
      // }}
      >
        <div className="w-full py-12 px-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="w-full flex justify-between md:justify-center gap-4 md:gap-24 max-w-md mx-auto md:max-w-2xl">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90 rounded-full h-12 flex-1"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-accent text-white hover:bg-accent/90 border-white border-2 rounded-full h-12 flex-1"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
