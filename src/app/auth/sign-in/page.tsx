"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { login } from "@/services/auth-helpers";
import { supabase } from "@/lib/supabase/client";
import Link from 'next/link'
import { ForgotPasswordModal } from "@/app/_components/auth/ForgotPasswordModal";


type AuthMode = "existing" | "new";

// Add CSS for scrolling animation
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
    color: #2952a3; /* blue shade, adjust as needed */
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-right: 0;
  }
`;

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as AuthMode) || "existing";

  const { mutateAsync: generateOtp } = api.auth.generateOtp.useMutation({
    onSuccess: (data) => {
      toast.success("Account created! Please check your email to verify your account.");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error(error.message || 'Failed to create account');
    }
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login(email, password);
      if (!response) {
        throw new Error("Failed to login");
      }

      toast.success("Logged in successfully!");
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Unexpected Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await generateOtp({
        email,
        password,
        name,
      });
      router.push(`/auth/verify?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&mode=${mode}`);
    } catch (error) {
      console.error('Unexpected Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "existing") {
      await handleSignIn(e);
    } else {
      await handleSignUp(e);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSocialLoading(null);
    }
  };

  const toggleMode = () => {
    const newMode = mode === "existing" ? "new" : "existing";
    router.push(`/auth/sign-in?mode=${newMode}`);
  };

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

      {/* Animated gradient background */}
      <div />

      <motion.div className="relative z-10 bg-white/80 backdrop-blur-lg p-4 sm:p-6 md:p-8 rounded-2xl border border-white/30 shadow-2xl w-full max-w-[90vw] sm:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <img src="/logo/essentials_pt_logo.png" alt="logo" className="rounded-lg" />
          <p className="text-brand-black text-sm sm:text-base mt-2">
            {mode === "existing"
              ? "Ready to push your limits?"
              : "Start your fitness journey today"
            }
          </p>
        </div>

        {/* {mode === "existing" && ( */}
        <>
          {/* <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialSignIn("google")}
              disabled={!!socialLoading}
              className="w-full bg-white text-gray-900 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {socialLoading === "google" ? "Connecting..." : "Continue with Google"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialSignIn("apple")}
              disabled={!!socialLoading}
              className="w-full bg-black text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-gray-700 text-sm sm:text-base"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.41-1.09-.47-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.41C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.89 3.51-.84 1.54.07 2.7.61 3.44 1.57-3.14 1.88-2.29 5.13.89 6.41-.65 1.29-1.51 2.58-2.92 4.03zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              {socialLoading === "apple" ? "Connecting..." : "Continue with Apple"}
            </motion.button>
          </div> */}

          {/* <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">or continue with email</span>
            </div>
          </div> */}

          <form onSubmit={handleEmailSubmit} className="space-y-4 sm:space-y-6">
            {mode === "new" && (
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-brand-light-yellow rounded-lg text-brand-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base"
                  required
                />
              </div>
            )}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-brand-light-yellow rounded-lg text-brand-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-brand-light-yellow  rounded-lg text-brand-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base"
                required
              />
              {mode === "existing" && (
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-brand-cobalt text-sm hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-bright-orange text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading
                ? "Thinking..."
                : mode === "existing"
                  ? "Sign In"
                  : "Create Account"}
            </motion.button>

         
              <p className="text-xs text-center text-gray-500 px-2">
                By signing up, you agree to our{' '}
                <Link href="/terms-of-service" className="text-brand-cobalt underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy-policy" className="text-brand-cobalt underline">Privacy Policy</Link>.
              </p>
    
          </form>
        </>
        {/* )} */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-brand-black text-sm sm:text-base">
            {mode === "existing" ? "Don't have an account?" : "Already have an account?"}{" "}
            <Button
              onClick={toggleMode}
              className="bg-background text-brand-cobalt font-semibold hover:bg-accent/90 text-sm sm:text-base"
            >
              {mode === "existing" ? "Sign Up" : "Sign In"}
            </Button>
          </p>
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

      <ForgotPasswordModal 
        open={showForgotPassword} 
        onOpenChange={setShowForgotPassword} 
      />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}