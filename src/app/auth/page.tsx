'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth/sign-in?mode=new');
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in?mode=existing');
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/50 to-transparent">
        <div className="container mx-auto flex justify-between md:justify-center gap-4 md:gap-24">
          <Button
            className="bg-white text-black hover:bg-white/90"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            className="bg-accent text-white hover:bg-accent/90 border-white/20"
            onClick={handleSignIn}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
