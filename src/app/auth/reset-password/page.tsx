"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updatePassword } from "@/services/auth-helpers";
import { supabase } from "@/lib/supabase/client";

// Add CSS for scrolling animation (matching sign-in page)
const scrollStyles = `
  @keyframes scrollText {
    0% {
      transform: translateX(-50%);
    }
    100% {
      transform: translateX(0);
    }
  }
  
  .scroll-container {
    overflow: hidden;
    width: 100%;
    background: transparent;
    height: 2.5rem;
    display: flex;
    align-items: center;
    position: relative;
  }
  
  .scroll-ticker-track {
    display: flex;
    width: max-content;
    animation: scrollText 27s linear infinite;
  }
  
  .scroll-ticker {
    white-space: nowrap;
    font-size: 1.25rem;
    font-weight: bold;
    color: #2952a3;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-right: 0;
  }
`;

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsValidSession(true);
      } else {
        // If no session, try to handle URL hash parameters for password recovery
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        if (accessToken && refreshToken && type === 'recovery') {
          // Set the session using the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (data.session && !error) {
            setIsValidSession(true);
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            toast.error("Invalid or expired reset link. Please request a new one.");
            setTimeout(() => router.push('/auth/sign-in?mode=existing'), 2000);
          }
        } else {
          toast.error("Invalid reset link. Please request a new password reset.");
          setTimeout(() => router.push('/auth/sign-in?mode=existing'), 2000);
        }
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(password);
      toast.success("Password updated successfully!");
      
      // Redirect to dashboard after successful password reset
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
      
    } catch (error) {
      console.error('Password update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-brand-white">
        {/* Background video */}
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

        <motion.div className="relative z-10 bg-white/80 backdrop-blur-lg p-4 sm:p-6 md:p-8 rounded-2xl border border-white/30 shadow-2xl w-full max-w-[90vw] sm:max-w-md">
          <div className="text-center">
            <img src="/logo/essentials_pt_logo.png" alt="logo" className="rounded-lg mx-auto mb-4" />
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-bright-orange mx-auto"></div>
            <p className="text-brand-black text-sm mt-4">Verifying reset link...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-brand-white">
      {/* Inject CSS for scrolling animation */}
      <style dangerouslySetInnerHTML={{ __html: scrollStyles }} />

      {/* Background video */}
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

      <motion.div className="relative z-10 bg-white/80 backdrop-blur-lg p-4 sm:p-6 md:p-8 rounded-2xl border border-white/30 shadow-2xl w-full max-w-[90vw] sm:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <img src="/logo/essentials_pt_logo.png" alt="logo" className="rounded-lg mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-brand-black mb-2">
            Reset Your Password
          </h1>
          <p className="text-brand-black text-sm sm:text-base">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-brand-light-yellow rounded-lg text-brand-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-cobalt focus:border-transparent transition-all text-sm sm:text-base"
              required
              minLength={8}
              autoFocus
            />
          </div>

          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-brand-light-yellow rounded-lg text-brand-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-cobalt focus:border-transparent transition-all text-sm sm:text-base"
              required
              minLength={8}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-bright-orange text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-brand-bright-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </motion.button>
        </form>

        <div className="mt-6 sm:mt-8 text-center">
          <Button
            onClick={() => router.push('/auth/sign-in?mode=existing')}
            variant="outline"
            className="bg-transparent text-brand-black border-gray-300 hover:bg-gray-100"
          >
            Back to Sign In
          </Button>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <div className="scroll-container">
            <div className="scroll-ticker-track">
              <span className="scroll-ticker">
                EMPOWER ● MOVE ● ENERGISE ● EMPOWER ● MOVE ● ENERGISE ● EMPOWER ● MOVE ● ENERGISE ● EMPOWER ● MOVE ● ENERGISE ● EMPOWER ● MOVE ● ENERGISE ●
              </span>
              <span className="scroll-ticker" aria-hidden="true">
                EMPOWER ● MOVE ● ENERGISE ● EMPOWER ● MOVE ● ENERGISE ● EMPOWER ● MOVE ● ENERGISE ● EMPOWER ● MOVE ● ENERGISE ● EMPOWER ● MOVE ● ENERGISE ●
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-bright-orange"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}