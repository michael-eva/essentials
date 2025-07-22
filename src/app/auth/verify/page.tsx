"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { supabase } from "@/lib/supabase/client";
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
    animation: scrollText 16s linear infinite;
  }
  
  .scroll-ticker {
    white-space: nowrap;
    font-size: 1.25rem;
    font-weight: bold;
    color: #2952a3; /* blue shade, adjust as needed */
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-right: 2rem;
  }
`;

function VerifyForm() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const name = searchParams.get("name") ?? "";
  const mode = searchParams.get("mode") ?? "existing";
  const redirectedFrom = searchParams.get("redirectedFrom") ?? "/welcome";

  const { mutateAsync: verifyOtp } = api.auth.verifyOtp.useMutation();
  const { mutateAsync: generateOtp } = api.auth.generateOtp.useMutation();

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await verifyOtp({ email, token: otp });
      if (!response.user) {
        toast.error("Verification failed. Please try again.");
        return;
      }

      // Set the session in the client
      if (response.session) {
        const { error } = await supabase.auth.setSession({
          access_token: response.session.access_token,
          refresh_token: response.session.refresh_token,
        });

        if (error) {
          toast.error("Failed to set session. Please try again.");
          return;
        }
      }

      toast.success(mode === "existing" ? "Welcome back! Let's crush your fitness goals!" : "Account verified! Let's crush your fitness goals!");
      router.push(redirectedFrom);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await generateOtp({
        email,
        password: "",
        name
      });
      toast.success("New code sent to your email!");
    } catch (error) {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToSignIn = () => {
    router.push(`/auth/sign-in?mode=${mode}`);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-brand-white">
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

      <motion.div className="relative z-10 bg-white/20 backdrop-blur-lg p-4 sm:p-6 md:p-8 rounded-2xl border border-white/30 shadow-2xl w-full max-w-[90vw] sm:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-brown mb-2">
            Enter Verification Code
          </h1>
          <p className="text-brand-black text-sm sm:text-base">
            We sent a 6-digit code to {email}
          </p>
        </div>

        <form onSubmit={handleOtpSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-brand-light-yellow rounded-lg text-brand-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base text-center text-2xl tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-brand-bright-orange text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </motion.button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-brand-black hover:text-brand-brown transition-colors text-sm underline disabled:opacity-50"
            >
              Resend code
            </button>
            <br />
            <button
              type="button"
              onClick={goBackToSignIn}
              className="text-brand-black hover:text-brand-brown transition-colors text-sm underline"
            >
              Change email address
            </button>
          </div>
        </form>
        <div className="mt-8 sm:mt-12 text-center">
          <div className="scroll-container">
            <div className="scroll-ticker-track">
              <span className="scroll-ticker">
                EMPOWER ● MOVE ● ENERGISE ● EMPOWER ● MOVE ● ENERGISE ● EMPOWER ● MOVE ● ENERGISE ●
              </span>
              <span className="scroll-ticker" aria-hidden="true">
                EMPOWER ● MOVE ● ENERGISE ● EMPOWER ● MOVE ● ENERGISE ● EMPOWER ● MOVE ● ENERGISE ●
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}
