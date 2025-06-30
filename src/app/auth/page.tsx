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
    <div className="relative h-screen w-full overflow-hidden w-full">
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
      <div className="absolute bottom-0 left-0 right-0 pb-8 px-2 bg-gradient-to-t from-black/50 to-transparent w-full">
        <div className="container flex justify-between md:justify-center gap-4 md:gap-24">
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
  );
}
