"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { supabase } from "@/lib/supabase/client";

function VerifyForm() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
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
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black animate-gradient" />

      {/* Animated pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,_transparent_25%,_rgba(255,255,255,0.05)_25%,_rgba(255,255,255,0.05)_50%,_transparent_50%,_transparent_75%,_rgba(255,255,255,0.05)_75%)] bg-[length:20px_20px]" />
      </div>

      {/* Glowing accent elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-red-500/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <motion.div className="relative z-10 bg-black/40 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-[90vw] sm:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Enter Verification Code
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
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
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base text-center text-2xl tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-accent text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </motion.button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-gray-400 hover:text-white transition-colors text-sm underline disabled:opacity-50"
            >
              Resend code
            </button>
            <br />
            <button
              type="button"
              onClick={goBackToSignIn}
              className="text-gray-400 hover:text-white transition-colors text-sm underline"
            >
              Change email address
            </button>
          </div>
        </form>
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
